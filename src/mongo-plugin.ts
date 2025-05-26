import { SigilPlugin } from "@sigiljs/sigil"
import { MongoClient, MongoClientOptions } from "mongodb"
import MongoController from "~/mongo-controller"

export interface MongoPluginConfig {
  /** MongoDB connection URI */
  connectUri: string
  /** MongoDB client options */
  clientOptions?: MongoClientOptions
}

/**
 * Plugin for SigilJS framework that provides MongoDB interactions
 */
export default class MongoPlugin extends SigilPlugin<MongoPluginConfig> {
  readonly #client: MongoClient
  constructor() {
    super()

    this.#client = new MongoClient(this.$pluginConfig.connectUri, this.$pluginConfig.clientOptions)
  }

  public async onInitialize() {
    await this.#client.connect()
  }

  /**
   * Create new instance of the MongoDB controller for specific database
   *
   * @param {string} databaseName name of the database
   * @returns {MongoController} instance of the MongoDB controller
   */
  public createController(databaseName: string): MongoController {
    return new MongoController(this.#client, databaseName, this.logger)
  }
}