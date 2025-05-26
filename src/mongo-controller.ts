import { Db, MongoClient } from "mongodb"

export enum ConnectionStatus {
  /** The controller is currently connected to the database */
  Connected,
  /** The controller is currently disconnected from the database */
  Disconnected
}

interface ILogOptions {
  /** Log level (severity) */
  level: "warning" | "error" | "info" | "success"
  /** Message content, or function that formats the message */
  message: string[] | string | ((dim: (payload: string) => string) => string)
  /** Optional JSON payload to include in the log */
  json?: any
  /** Optional condition; if false, skip logging */
  condition?: any
}

/**
 * Controller for managing MongoDB connections and operations.
 */
export default class MongoController {
  private _database?: Db

  /**
   * Tracks the current connection status.
   * @default ConnectionStatus.Disconnected
   * @private
   */
  private _connectionStatus: ConnectionStatus = ConnectionStatus.Disconnected

  constructor(
    private readonly client: MongoClient,
    private readonly _dbName: string,
    private readonly log: (opts: ILogOptions) => void
  ) {}

  /**
   * Gets the current connection status.
   */
  public get connectionStatus(): ConnectionStatus {
    return this._connectionStatus
  }

  /**
   * Gets the name of the configured database.
   */
  public get databaseName(): string {
    return this._dbName
  }

  /**
   * Gets the current database instance, if connected.
   */
  public get db(): Db | undefined {
    return this._database
  }

  /**
   * Gets the current database instance, cast as non-undefined.
   * Use with caution; throws if not connected.
   */
  public get unsafeDB(): Db {
    return this._database as Db
  }

  /**
   * Ensures that there is an active connection to the database.
   * @throws Error if not connected
   */
  public checkConnection(): void {
    if (this._connectionStatus !== ConnectionStatus.Connected) {
      throw new Error("Not connected to database")
    }
  }

  /**
   * Disconnects from the MongoDB server.
   * If already disconnected, does nothing.
   * @returns promise that resolves to true if disconnection succeeded or was unnecessary,
   * or false if an error occurred during client.close()
   */
  public async disconnect(): Promise<boolean> {
    if (this._connectionStatus === ConnectionStatus.Disconnected) {
      return true
    }

    const result = await this.client.close().catch(() => null)
    if (result === null) {
      return false
    }

    this._connectionStatus = ConnectionStatus.Disconnected
    this.log({
      level: "info",
      message: `Connection to database ${this._dbName} closed`,
      json: { milestone: "disconnect", ok: true }
    })

    return true
  }

  /**
   * Connects (or reconnects) to the MongoDB server and selects the database.
   * If already connected, does nothing.
   * @returns promise that resolves to true if connection succeeded or was unnecessary,
   * or false if an error occurred during client.connect()
   */
  public async reconnect(): Promise<boolean> {
    if (this._connectionStatus === ConnectionStatus.Connected) {
      return true
    }

    const startTime = performance.now()
    const result = await this.client.connect().catch(() => null)
    if (!result) {
      return false
    }

    this._database = this.client.db(this._dbName)
    const elapsed = performance.now() - startTime
    this._connectionStatus = ConnectionStatus.Connected
    this.log({
      level: "info",
      message: `Connection to database ${this._dbName} established in ${elapsed}ms`,
      json: { milestone: "connect", ok: true, time: elapsed, db: this._dbName }
    })

    return true
  }

  /**
   * Retrieves a collection from the connected database.
   * @typeParam T shape of the documents in the collection
   * @param name name of the collection to access
   * @returns MongoDB Collection instance
   * @throws Error if not connected
   */
  public collection<T extends object = any>(name: string) {
    this.checkConnection()
    return this.unsafeDB.collection<T>(name)
  }
}
