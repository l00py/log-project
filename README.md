[![](https://github.com/l00py/log-project/actions/workflows/ci.yaml/badge.svg)](https://github.com/l00py/log-project/actions/workflows/ci.yaml)

# Log Agent <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [1. Project](#1-project)
  - [1.1. Problem Statement](#11-problem-statement)
  - [1.2. Acceptance Criteria](#12-acceptance-criteria)
  - [1.3. Assumptions](#13-assumptions)
  - [1.4. Programming Language Used](#14-programming-language-used)
  - [1.5. Tech Stack / Frameworks / Libraries Used](#15-tech-stack--frameworks--libraries-used)
  - [1.6. Project Structure](#16-project-structure)
- [2. Setup Requirements](#2-setup-requirements)
- [3. Get Started](#3-get-started)
  - [Override the default server port](#override-the-default-server-port)
- [4. Test the REST API `/logs` endpoint](#4-test-the-rest-api-logs-endpoint)
- [5. Log Agent - REST API](#5-log-agent---rest-api)
  - [5.1. Tail Log File](#51-tail-log-file)
    - [5.1.1. Query Parameters](#511-query-parameters)
    - [5.1.2. Success Response](#512-success-response)
    - [5.1.3. Error Response](#513-error-response)
- [6. Log Samples](#6-log-samples)

## 1. Project

### 1.1. Problem Statement
A customer has asked you for a way to provide on-demand monitoring of various unix-based
servers without having to log into each individual machine and opening up the log files found in
/var/log. The customer has asked for the ability to issue a REST request to a machine in order
to retrieve logs from /var/log on the machine receiving the REST request.

### 1.2. Acceptance Criteria
1. A README file describing how to run and use the service.
2. An HTTP REST API exposing at least one endpoint that can return the lines requested from a given log file.
3. The lines returned must be presented with the newest log events first. It is safe to assume that log files will be written with newest events at the end of the file.
4. The REST API should support additional query parameters which include
    - The ability to specify a filename within /var/log
    - The ability to specify the last n number of entries to retrieve within the log
    - The ability to filter results based on basic text/keyword matches
5. The service should work and be reasonable performant when requesting files of >1GB
6. Minimize the number of external dependencies in the business logic code path. For example, if implementing your project with Node.js:
    - Feel free to use Express or similar as the HTTP server as well as any of the built-in Node.js modules like fs.
    - Please do not use external libraries for any file reads or working with the log lines after you’ve read them. We want to see your solution in this case using only what Node.js has built-in.

### 1.3. Assumptions
1. The filtering of the results based on basic text/keyword is case insensitive.
2. The filtering of the results based on basic text/keyword is applied after the `n` number of lines are retrieved.
3. Securing the REST API endpoints is out-of-scope. E.g. request parameters validation, authentication, authorization, etc.
4. The REST API `/api/v1/logs` endpoint returns complete datasets without pagination. Currently out-of-scope, but strongly recommended for handling large files.

### 1.4. Programming Language Used
1. Typescript
2. (Javascript)

### 1.5. Tech Stack / Frameworks / Libraries Used
1. `nodemon`
2. `Express.js`
3. `Node.js`
4. `dotenv`
5. [pino](https://github.com/pinojs/pino): Node.js logger
6. [pino-http](https://github.com/pinojs/pino-http): HTTP logger for Node.js
7. `jest`

### 1.6. Project Structure
Key related files for the project.
```
src
├── api
│   └── v1
│       ├── configs
│       │   └── logConfig.ts        // Configurations related to the Log Service
│       ├── controllers
│       │   └── logController.ts    // Handles client requests and responses for the /logs endpoint
│       ├── index.ts                // Entrypoint to all the routes, in this case only GET /logs
│       ├── interfaces
│       │   ├── jsonApiInterface.ts // Json format for HTTP error responses
│       │   └── logInterface.ts     // Log interfaces
│       ├── routes
│       │   └── logRoute.ts         // Adds the /logs endpoint
│       ├── services
│       │   └── logService.ts       // Log service interfacing with the filesystem (i.e. fs)
│       └── utils
│           ├── httpStatusCodes.ts  // HTTP status codes enum
│           └── logger.ts           // Logger setup
tests
├── apiLogs.test.ts                 // Tests for /logs endpoint
├── samples
│   └── linux_2k.sample             // Sample data used for the tests
└── index.ts                        // Entrypoint to start the expressjs server
```

## 2. Setup Requirements
The project has been built with the node v20.10.0 runtime and has not undergone testing with alternative versions. Therefore, compatibility with other versions cannot be assured.
1. `nvm install 20`
1. `nvm use 20`

## 3. Get Started
The following steps uses `nodemon` to start the nodejs server on port `3000` by default:
1. Have this package copied on the logging server
1. `npm install`
1. `npm start`

### Override the default server port
1. Create a `.env` file
2. Add the following environment variable
    ```sh
    SERVER_PORT=<new_port_number>
    ```

## 4. Test the REST API `/logs` endpoint
The project uses `jest` to run the tests in the [./test](./tests/) directory.
1. Ensure that the expressjs server is not running. Otherwise stop it (i.e. CTRL+C).
1. `npm test`

## 5. Log Agent - REST API

### 5.1. Tail Log File
Get the last `n` (default=`10`) lines from a file under `/var/log`.

**URL**: `/api/v1/logs`

**Method**: `GET`

**Auth**: None (Out-of-scope)

**Permissions required**: None (Out-of-scope)

#### 5.1.1. Query Parameters

| Parameter  |              Required              |   Type   | Description                                                               | Example   |
| ---------- | :--------------------------------: | :------: | ------------------------------------------------------------------------- | --------- |
| `filename` | <span style="color:red">yes</span> | `string` | Filename to tail under `/var/log`                                         | `foo.log` |
| `n`        |                 no                 | `number` | Retrieves the last `n` number of lines. Defaults to `10` if omitted.      | `5`       |
| `filter`   |                 no                 | `string` | Filters the results based on basic text/keyword match. (case insensitive) | `pci`     |

#### 5.1.2. Success Response

**Code**: `200 OK`

**Content-Type**: `application/json`

**Content Examples**

`curl -k 'http://localhost:3000/api/v1/logs?filename=linux_2k.sample&n=10'`

```json
{
  "log": {
    "filename": "/var/log/linux_2k.sample",
    "count": 10,
    "events": [
      "Jul 27 14:42:00 combo kernel: Linux agpgart interface v0.100 (c) Dave Jones",
      "Jul 27 14:42:00 combo kernel: Real Time Clock Driver v1.12",
      "Jul 27 14:42:00 combo kernel: isapnp: No Plug & Play device found",
      "Jul 27 14:42:00 combo kernel: isapnp: Scanning for PnP cards...",
      "Jul 27 14:41:59 combo kernel: pci_hotplug: PCI Hot Plug PCI Core version: 0.5",
      "Jul 27 14:41:59 combo kernel: Initializing Cryptographic API",
      "Jul 27 14:41:59 combo kernel: SELinux:  Registering netfilter hooks",
      "Jul 27 14:41:59 combo kernel: Dquot-cache hash table entries: 1024 (order 0, 4096 bytes)",
      "Jul 27 14:41:59 combo kernel: VFS: Disk quotas dquot_6.5.1",
      "Jul 27 14:41:54 combo network: Bringing up loopback interface:  succeeded "
      ]
  }
}
```

`curl -k 'http://localhost:3000/api/v1/logs?filename=linux_2k.sample&n=100&filter=pci'`

```json
{
  "log": {
    "filename": "/var/log/linux_2k.sample",
    "count": 9,
    "events": [
      "Jul 27 14:41:59 combo kernel: pci_hotplug: PCI Hot Plug PCI Core version: 0.5",
      "Jul 27 14:41:59 combo kernel: PCI: Using IRQ router PIIX/ICH [8086/2410] at 0000:00:1f.0",
      "Jul 27 14:41:59 combo kernel: PCI: Probing PCI hardware (bus 00)",
      "Jul 27 14:41:59 combo kernel: PCI: Probing PCI hardware",
      "Jul 27 14:41:59 combo kernel: PCI: Invalid ACPI-PCI IRQ routing table",
      "Jul 27 14:41:58 combo kernel: ACPI: ACPI tables contain no PCI IRQ routing entries",
      "Jul 27 14:41:58 combo kernel: PCI: Using configuration type 1",
      "Jul 27 14:41:58 combo kernel: PCI: PCI BIOS revision 2.10 entry at 0xfc0ce, last bus=1",
      "Jul 27 14:41:58 combo rpcidmapd: rpc.idmapd startup succeeded"
    ]
  }
}
```

#### 5.1.3. Error Response

Query parameter `filename` not provided.

`curl -k 'http://localhost:3000/api/v1/logs'`

```json
{
  "errors": [
    {
      "status": 400,
      "source": {
          "parameter": "name"
      },
      "title": "Missing Required Query Parameter",
      "detail": "The `filename` query parameter is required but was not provided."
    }
  ]
}
```

## 6. Log Samples
The [./tests/samples/linux_2k.sample](./tests/samples/linux_2k.sample) file was taken from https://github.com/logpai/loghub.