#!/bin/sh
curl -X POST http://localhost:3000/api/seed-users \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"email": "admin@creomotion.com", "password": "admin123", "name": "Admin User", "role": "ADMIN"},
      {"email": "editor@creomotion.com", "password": "editor123", "name": "Editor User", "role": "EDITOR"}
    ],
    "clients": [
      {"name": "Demo Client", "email": "demo@client.com", "company": "Demo Company"}
    ]
  }'
