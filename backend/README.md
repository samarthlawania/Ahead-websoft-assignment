# Dynamic Form Builder Backend

Express + Mongoose backend with strict validation and admin authentication.

## Build and Run

```bash
# With Docker
docker-compose up --build

# Local development
npm install
npm start
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/formbuilder)
- `ADMIN_TOKEN`: Admin authentication token (default: admin-secret-token)
- `PORT`: Server port (default: 3000)

## API Examples

### Admin Authentication
All admin endpoints require: `Authorization: Bearer admin-secret-token`

### Create Form
```
POST /api/admin/forms
Content-Type: application/json
Authorization: Bearer admin-secret-token

{
  "title": "Contact Form",
  "description": "Basic contact form",
  "fields": [
    {
      "label": "Name",
      "name": "name",
      "type": "text",
      "required": true,
      "order": 0
    },
    {
      "label": "Email",
      "name": "email", 
      "type": "email",
      "required": true,
      "order": 1
    }
  ]
}
```

### Submit Form
```
POST /api/forms/{formId}/submissions
Content-Type: application/json

{
  "answers": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Response Examples

**Success (201):**
```json
{ "id": "507f1f77bcf86cd799439011" }
```

**Validation Error (400):**
```json
{
  "errors": {
    "name": "Name is required",
    "email": "Invalid email format"
  }
}
```

## Endpoints

### Admin (requires auth)
- `GET /api/admin/forms` - List forms
- `POST /api/admin/forms` - Create form
- `GET /api/admin/forms/:id` - Get form
- `PUT /api/admin/forms/:id` - Update form (increments version)
- `DELETE /api/admin/forms/:id` - Delete form
- `POST /api/admin/forms/:id/fields` - Add field
- `PUT /api/admin/forms/:id/fields/:fieldId` - Update field
- `DELETE /api/admin/forms/:id/fields/:fieldId` - Delete field
- `GET /api/admin/forms/:id/submissions?page=1&limit=10` - List submissions

### Public
- `GET /api/forms/:id` - Get form
- `POST /api/forms/:id/submissions` - Submit form