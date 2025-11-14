# EMCS Blockchain API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-backend-url.com`

## Authentication

All endpoints that modify blockchain state require a valid wallet address in the request body. The wallet must have sufficient testnet tokens for transaction fees.

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-11-14T10:00:00Z"
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-14T10:00:00Z",
  "service": "emcs-backend"
}
```


### API Information

#### GET /api

Get API information and available endpoints.

**Response**:
```json
{
  "message": "EMCS Blockchain Demo API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "consignments": "/api/consignments",
    "createConsignment": "POST /api/consignments",
    "listConsignments": "GET /api/consignments?operator={address}",
    "getConsignment": "GET /api/consignments/:arc",
    "dispatchConsignment": "POST /api/consignments/:arc/dispatch",
    "receiveConsignment": "POST /api/consignments/:arc/receive",
    "getConsignmentEvents": "GET /api/consignments/:arc/events"
  }
}
```

### Create Consignment

#### POST /api/consignments

Create a new consignment record on the blockchain.

**Request Body**:
```json
{
  "consignor": "0x1234567890abcdef1234567890abcdef12345678",
  "consignee": "0xabcdef1234567890abcdef1234567890abcdef12",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany"
}
```

**Parameters**:
- `consignor` (string, required) - Wallet address of sender
- `consignee` (string, required) - Wallet address of receiver
- `goodsType` (string, required) - Type of goods (Wine, Beer, Spirits, Tobacco, Energy)
- `quantity` (number, required) - Quantity of goods (must be positive)
- `unit` (string, required) - Unit of measurement (Liters, Kilograms, Units)
- `origin` (string, required) - Origin location
- `destination` (string, required) - Destination location

**Response** (201 Created):
```json
{
  "success": true,
  "arc": "24EU12345678901234567",
  "transactionId": "0xabc123...",
  "consignmentId": "0xdef456..."
}
```

**Errors**:
- `400` - Invalid request parameters
- `500` - Blockchain transaction failed


### List Consignments

#### GET /api/consignments

List all consignments for a specific operator.

**Query Parameters**:
- `operator` (string, required) - Wallet address of operator
- `status` (string, optional) - Filter by status (Draft, In Transit, Received)

**Example Request**:
```
GET /api/consignments?operator=0x1234...&status=In%20Transit
```

**Response** (200 OK):
```json
{
  "consignments": [
    {
      "arc": "24EU12345678901234567",
      "consignor": "0x1234...",
      "consignee": "0xabcd...",
      "goodsType": "Wine",
      "quantity": 1000,
      "unit": "Liters",
      "origin": "Bordeaux, France",
      "destination": "Berlin, Germany",
      "status": "In Transit",
      "createdAt": "2025-11-13T10:00:00Z",
      "dispatchedAt": "2025-11-13T11:00:00Z"
    }
  ]
}
```

### Get Consignment Details

#### GET /api/consignments/:arc

Get detailed information about a specific consignment.

**Path Parameters**:
- `arc` (string, required) - Administrative Reference Code

**Example Request**:
```
GET /api/consignments/24EU12345678901234567
```

**Response** (200 OK):
```json
{
  "arc": "24EU12345678901234567",
  "consignor": "0x1234...",
  "consignee": "0xabcd...",
  "goodsType": "Wine",
  "quantity": 1000,
  "unit": "Liters",
  "origin": "Bordeaux, France",
  "destination": "Berlin, Germany",
  "status": "In Transit",
  "documentHash": "0x789...",
  "createdAt": "2025-11-13T10:00:00Z",
  "dispatchedAt": "2025-11-13T11:00:00Z",
  "receivedAt": null
}
```

**Errors**:
- `404` - Consignment not found


### Dispatch Consignment

#### POST /api/consignments/:arc/dispatch

Dispatch a consignment (change status from Draft to In Transit).

**Path Parameters**:
- `arc` (string, required) - Administrative Reference Code

**Request Body**:
```json
{
  "consignor": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Parameters**:
- `consignor` (string, required) - Wallet address of consignor (must match consignment)

**Response** (200 OK):
```json
{
  "success": true,
  "transactionId": "0xabc123...",
  "documentHash": "0x789...",
  "dispatchedAt": "2025-11-13T11:00:00Z"
}
```

**Errors**:
- `400` - Invalid consignor or consignment not in Draft status
- `404` - Consignment not found
- `500` - Blockchain transaction failed

### Receive Consignment

#### POST /api/consignments/:arc/receive

Confirm receipt of a consignment (change status from In Transit to Received).

**Path Parameters**:
- `arc` (string, required) - Administrative Reference Code

**Request Body**:
```json
{
  "consignee": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

**Parameters**:
- `consignee` (string, required) - Wallet address of consignee (must match consignment)

**Response** (200 OK):
```json
{
  "success": true,
  "transactionId": "0xabc123...",
  "receivedAt": "2025-11-13T15:00:00Z"
}
```

**Errors**:
- `400` - Invalid consignee or consignment not in In Transit status
- `404` - Consignment not found
- `500` - Blockchain transaction failed

### Get Consignment Events

#### GET /api/consignments/:arc/events

Get movement history for a consignment.

**Path Parameters**:
- `arc` (string, required) - Administrative Reference Code

**Example Request**:
```
GET /api/consignments/24EU12345678901234567/events
```

**Response** (200 OK):
```json
{
  "events": [
    {
      "type": "Created",
      "timestamp": "2025-11-13T10:00:00Z",
      "actor": "0x1234...",
      "transactionId": "0xabc..."
    },
    {
      "type": "Dispatched",
      "timestamp": "2025-11-13T11:00:00Z",
      "actor": "0x1234...",
      "transactionId": "0xdef...",
      "documentHash": "0x789..."
    },
    {
      "type": "Received",
      "timestamp": "2025-11-13T15:00:00Z",
      "actor": "0xabcd...",
      "transactionId": "0xghi..."
    }
  ]
}
```

**Errors**:
- `404` - Consignment not found

## Data Models

### Consignment

```typescript
interface Consignment {
  arc: string;                    // Unique identifier (21 chars)
  consignor: string;              // Wallet address
  consignee: string;              // Wallet address
  goodsType: string;              // Wine, Beer, Spirits, Tobacco, Energy
  quantity: number;               // Positive number
  unit: string;                   // Liters, Kilograms, Units
  origin: string;                 // Origin location
  destination: string;            // Destination location
  status: string;                 // Draft, In Transit, Received
  documentHash?: string;          // SHA256 hash (after dispatch)
  createdAt: string;              // ISO 8601 timestamp
  dispatchedAt?: string;          // ISO 8601 timestamp
  receivedAt?: string;            // ISO 8601 timestamp
}
```

### Movement Event

```typescript
interface MovementEvent {
  type: string;                   // Created, Dispatched, Received
  timestamp: string;              // ISO 8601 timestamp
  actor: string;                  // Wallet address
  transactionId: string;          // Blockchain transaction ID
  documentHash?: string;          // SHA256 hash (for Dispatched events)
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider implementing rate limiting to prevent abuse.

## CORS

The API supports CORS for the configured frontend URL. Set `FRONTEND_URL` in backend `.env` to allow requests from your frontend.

## Error Handling

All errors include:
- `error` - Error message
- `timestamp` - ISO 8601 timestamp
- `status` - HTTP status code

Example error response:
```json
{
  "error": "Consignment not found",
  "timestamp": "2025-11-14T10:00:00Z",
  "status": 404
}
```

## Testing

Use the provided test scripts to verify API functionality:

```bash
# Linux/Mac
./test-api.sh YOUR_WALLET_ADDRESS

# Windows
test-api.bat YOUR_WALLET_ADDRESS
```

Or use curl:

```bash
# Health check
curl http://localhost:3000/health

# Create consignment
curl -X POST http://localhost:3000/api/consignments \
  -H "Content-Type: application/json" \
  -d '{
    "consignor": "0x1234...",
    "consignee": "0xabcd...",
    "goodsType": "Wine",
    "quantity": 1000,
    "unit": "Liters",
    "origin": "Bordeaux",
    "destination": "Berlin"
  }'
```

## Support

For issues or questions:
- Check [Backend Configuration Guide](backend/CONFIGURATION.md)
- Review [Troubleshooting Section](README.md#troubleshooting)
- Open an issue on GitHub
