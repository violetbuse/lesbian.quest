# API Documentation

This document provides comprehensive documentation for all API routes in the Lesbian Quest application.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Health Check](#health-check)
- [Creator Routes](#creator-routes)
  - [Adventures](#adventures)
    - [POST /api/creators/adventures](#post-apicreatorsadventures)
    - [GET /api/creators/adventures](#get-apicreatorsadventures)
    - [GET /api/creators/adventures/:id](#get-apicreatorsadventuresid)
  - [Scenes](#scenes)
    - [POST /api/creators/scenes/:adventureId](#post-apicreatorsscenesadventureid)
    - [GET /api/creators/scenes/:adventureId](#get-apicreatorsscenesadventureid)
    - [GET /api/creators/scenes/:adventureId/:id](#get-apicreatorsscenesadventureidid)
  - [Choices](#choices)
    - [POST /api/creators/choices/:adventureId/:fromSceneId](#post-apicreatorschoicesadventureidfromsceneid)
    - [GET /api/creators/choices/:adventureId/:fromSceneId](#get-apicreatorschoicesadventureidfromsceneid)
    - [GET /api/creators/choices/:adventureId/:fromSceneId/:id](#get-apicreatorschoicesadventureidfromsceneidid)
  - [Atomic Operations](#atomic-operations)
    - [POST /api/creators/atomic](#post-apicreatorsatomic)
- [Player Routes](#player-routes)
  - [Progress](#progress)
    - [GET /api/players/progress/:adventureId](#get-apiplayersprogressadventureid)
    - [POST /api/players/progress/:adventureId](#post-apiplayersprogressadventureid)
    - [DELETE /api/players/progress/:adventureId](#delete-apiplayersprogressadventureid)
  - [Interactions](#interactions)
    - [Favorite an Adventure](#favorite-an-adventure)
    - [Remove Favorite](#remove-favorite)
    - [Like an Adventure](#like-an-adventure)
    - [Unlike an Adventure](#unlike-an-adventure)
    - [Save an Adventure](#save-an-adventure)
    - [Remove Save](#remove-save)
    - [Get User Interactions](#get-user-interactions)
- [Error Responses](#error-responses)
- [Data Validation](#data-validation)

## Base URL

All API routes are prefixed with `/api`.

## Authentication

Most routes require authentication using Clerk. The user's ID is extracted from the request context.

## Health Check

### GET /

Returns the health status of the API.

**Response:**
```json
{
    "status": "ok"
}
```

## Creator Routes

### Adventures

#### POST /api/creators/adventures

Creates a new adventure.

**Request Body:**
```json
{
    "title": "string (1-100 chars)",
    "description": "string (1-1000 chars)",
    "isPublished": "boolean (optional)"
}
```

**Response:**
- Status: 201 Created
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "isPublished": "boolean",
    "authorId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```

#### GET /api/creators/adventures

Gets all adventures for the current user.

**Response:**
- Status: 200 OK
```json
[
    {
        "id": "string",
        "title": "string",
        "description": "string",
        "isPublished": "boolean",
        "authorId": "string",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
    }
]
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```

#### GET /api/creators/adventures/:id

Gets a specific adventure.

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "isPublished": "boolean",
    "authorId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Adventure not found"
}
```

### Scenes

#### POST /api/creators/scenes/:adventureId

Creates a new scene within an adventure.

**Request Body:**
```json
{
    "title": "string (1-100 chars)",
    "content": "string",
    "imageUrl": "string (URL, optional)",
    "isStartScene": "boolean (optional)",
    "order": "number (integer, min 0)"
}
```

**Response:**
- Status: 201 Created
```json
{
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string | null",
    "isStartScene": "boolean",
    "order": "number",
    "adventureId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```

#### GET /api/creators/scenes/:adventureId

Gets all scenes for an adventure.

**Response:**
- Status: 200 OK
```json
[
    {
        "id": "string",
        "title": "string",
        "content": "string",
        "imageUrl": "string | null",
        "isStartScene": "boolean",
        "order": "number",
        "adventureId": "string",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
    }
]
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```

#### GET /api/creators/scenes/:adventureId/:id

Gets a specific scene.

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string | null",
    "isStartScene": "boolean",
    "order": "number",
    "adventureId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```

#### PUT /api/creators/scenes/:adventureId/:id

Updates a specific scene.

**Request Body:**
```json
{
    "title": "string (1-100 chars)",
    "content": "string",
    "imageUrl": "string (URL, optional)",
    "isStartScene": "boolean (optional)",
    "order": "number (integer, min 0)"
}
```

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string | null",
    "isStartScene": "boolean",
    "order": "number",
    "adventureId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```

#### DELETE /api/creators/scenes/:adventureId/:id

Deletes a specific scene.

**Request Body:**
```json
{
    "redirectProgressionToSceneId": "string"
}
```

**Response:**
- Status: 200 OK
```json
{
    "success": true
}
```

**Error Responses:**
- 400 Bad Request:
```json
{
    "error": "Cannot delete the start scene. Set another scene as the start scene first."
}
```
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```

### Choices

#### POST /api/creators/choices/:adventureId/:fromSceneId

Creates a new choice between scenes.

**Request Body:**
```json
{
    "text": "string (1-500 chars)",
    "toSceneId": "string",
    "imageUrl": "string (URL, optional)",
    "condition": "string (optional)",
    "order": "number (integer, min 0)"
}
```

**Response:**
- Status: 201 Created
```json
{
    "id": "string",
    "text": "string",
    "imageUrl": "string | null",
    "condition": "string | null",
    "order": "number",
    "fromSceneId": "string",
    "toSceneId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```

#### GET /api/creators/choices/:adventureId/:fromSceneId

Gets all choices for a scene.

**Response:**
- Status: 200 OK
```json
[
    {
        "id": "string",
        "text": "string",
        "imageUrl": "string | null",
        "condition": "string | null",
        "order": "number",
        "fromSceneId": "string",
        "toSceneId": "string",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
    }
]
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```

#### GET /api/creators/choices/:adventureId/:fromSceneId/:id

Gets a specific choice.

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "text": "string",
    "imageUrl": "string | null",
    "condition": "string | null",
    "order": "number",
    "fromSceneId": "string",
    "toSceneId": "string",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Scene not found"
}
```
or
```json
{
    "error": "Choice not found"
}
```

### Atomic Operations

#### POST /api/creators/atomic

Performs atomic operations for creating, updating, or deleting adventure content.

**Request Body:**
```json
{
    "operations": [
        {
            "type": "createAdventure" | "updateAdventure" | "deleteAdventure" | "createScene" | "updateScene" | "deleteScene",
            "data": {
                // Operation-specific data
            },
            "id": "string (required for update/delete operations)",
            "adventureId": "string (required for createScene)"
        }
    ]
}
```

**Response:**
- Status: 200 OK
```json
{
    "success": "boolean",
    "results": [
        // Array of created/updated/deleted resources
    ]
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Resource not found"
}
```

## Player Routes

### Progress

#### GET /api/players/progress/:adventureId

Retrieves the player's progress for a specific adventure.

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "userId": "string",
    "adventureId": "string",
    "currentSceneId": "string",
    "variables": "object",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)",
    "currentScene": {
        "id": "string",
        "title": "string",
        "content": "string",
        "isStartScene": "boolean",
        "order": "number",
        "adventureId": "string",
        "imageUrl": "string | null",
        "createdAt": "string (ISO date) | null",
        "updatedAt": "string (ISO date) | null"
    }
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Progress not found"
}
```

#### POST /api/players/progress/:adventureId

Creates new progress for a specific adventure.

**Request Body:**
```json
{
    "adventureId": "string",
    "currentSceneId": "string",
    "variables": "object (optional)"
}
```

**Response:**
- Status: 201 Created
```json
{
    "id": "string",
    "userId": "string",
    "adventureId": "string",
    "currentSceneId": "string",
    "variables": "object",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```

#### PATCH /api/players/progress/:adventureId

Updates existing progress for a specific adventure.

**Request Body:**
```json
{
    "currentSceneId": "string (optional)",
    "variables": "object (optional)"
}
```

**Response:**
- Status: 200 OK
```json
{
    "id": "string",
    "userId": "string",
    "adventureId": "string",
    "currentSceneId": "string",
    "variables": "object",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Progress not found"
}
```

#### DELETE /api/players/progress/:adventureId

Deletes the player's progress for a specific adventure.

**Response:**
- Status: 200 OK
```json
{
    "success": true
}
```

**Error Responses:**
- 401 Unauthorized:
```json
{
    "error": "Unauthorized"
}
```
- 404 Not Found:
```json
{
    "error": "Progress not found"
}
```

### Interactions

#### Favorite an Adventure
```http
POST /api/players/adventures/:adventureId/favorite
```

Adds an adventure to the user's favorites.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to favorite

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `400 Bad Request`: When the adventure is already favorited
- `401 Unauthorized`: When the user is not authenticated

#### Remove Favorite
```http
DELETE /api/players/adventures/:adventureId/favorite
```

Removes an adventure from the user's favorites.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to remove from favorites

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: When the user is not authenticated

#### Like an Adventure
```http
POST /api/players/adventures/:adventureId/like
```

Likes an adventure.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to like

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `400 Bad Request`: When the adventure is already liked
- `401 Unauthorized`: When the user is not authenticated

#### Unlike an Adventure
```http
DELETE /api/players/adventures/:adventureId/like
```

Removes a like from an adventure.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to unlike

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: When the user is not authenticated

#### Save an Adventure
```http
POST /api/players/adventures/:adventureId/save
```

Saves an adventure for later.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to save

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `400 Bad Request`: When the adventure is already saved
- `401 Unauthorized`: When the user is not authenticated

#### Remove Save
```http
DELETE /api/players/adventures/:adventureId/save
```

Removes an adventure from the user's saves.

**Parameters:**
- `adventureId` (path parameter): The ID of the adventure to remove from saves

**Response:**
```json
{
    "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: When the user is not authenticated

#### Get User Interactions
```http
GET /api/players/adventures/interactions
```

Retrieves all user interactions (favorites, likes, and saves).

**Response:**
```json
{
    "favorites": [
        {
            "id": "adventure-id",
            "title": "Adventure Title",
            "description": "Adventure Description",
            "isPublished": true,
            "authorId": "author-id",
            "createdAt": "2024-03-21T12:00:00Z",
            "updatedAt": "2024-03-21T12:00:00Z"
        }
    ],
    "likes": [
        {
            "id": "adventure-id",
            "title": "Adventure Title",
            "description": "Adventure Description",
            "isPublished": true,
            "authorId": "author-id",
            "createdAt": "2024-03-21T12:00:00Z",
            "updatedAt": "2024-03-21T12:00:00Z"
        }
    ],
    "saves": [
        {
            "id": "adventure-id",
            "title": "Adventure Title",
            "description": "Adventure Description",
            "isPublished": true,
            "authorId": "author-id",
            "createdAt": "2024-03-21T12:00:00Z",
            "updatedAt": "2024-03-21T12:00:00Z"
        }
    ]
}
```

**Error Responses:**
- `401 Unauthorized`: When the user is not authenticated

## Error Responses

All routes may return the following error responses:

- 401 Unauthorized: When authentication is required but not provided
- 404 Not Found: When the requested resource doesn't exist
- 500 Internal Server Error: When an unexpected error occurs

## Data Validation

All routes use Zod for request validation. The schemas ensure:
- String length limits
- Required fields
- URL format validation
- Number range validation
- Boolean flags 