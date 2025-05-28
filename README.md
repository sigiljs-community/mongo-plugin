# Sigil MongoDB Plugin

> [!WARNING]
> Mongo database abstraction plugin for SigilJS is now deprecated. Please use `@kurai-io/mongo` instead
> 
> https://github.com/kurai-foundation/mongo

Plugin for SigilJS framework that provides MongoDB interactions

## Installation

```bash
npm install @sigiljs-community/mongo-plugin
# or
yarn add @sigiljs-community/mongo-plugin
```


## Usage

### Import and register the plugin

```typescript
import { Sigil } from "@sigiljs/sigil"
import { MongoPlugin } from "@sigiljs-community/mongo-plugin"

const app = new Sigil()

// Register plugin with settings
app.addPlugin(MongoPlugin, {
  /**
   * Mongo connect URI, required
   */
  connectUri: "mongodb://...",

  /**
   *  MongoDB client options, you can read more about it
   * in the mongo SDK documentation
   */
  clientOptions: {}
})
```

### Creating and interacting with controller
```typescript
const controller = app.plugin(MongoPlugin).createController("databaseName")

const usersCollection = controller.collection<{ userId: string }>("users")

// usersCollection is an instance of MongoDB collection
```

### Disconnecting and reconnecting
```typescript
// Disconnect from current instance
controller.disconnect()

// Reconnect to current instance
controller.reconnect()
```

## License

You can copy and paste the MIT license summary from below.

```text
MIT License

Copyright (c) 2022 Kurai Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

