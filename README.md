# AI Baby Generator

A web application that uses AI to generate realistic baby photos from parent images using Google's Gemini 2.5 Flash Image Preview model.

## Demo Video

🎥 **Watch the application in action**: [https://youtu.be/gfz2u4Sojfo](https://youtu.be/gfz2u4Sojfo)

## Features

- 🍼 **Baby Generation**: Generate baby photos from parent images using AI
- 👨‍👩‍👧‍👦 **Flexible Input**: Upload mother, father, existing baby, or ultrasound images (all optional)
- 🎂 **Age Specification**: Generate babies of specific ages (months or years)
- ⚥ **Gender Selection**: Choose baby gender or let AI decide
- 📈 **Age Progression**: Extrapolate generated babies to different ages
- 📱 **Responsive Design**: Beautiful dark theme with drag-and-drop interface
- 📝 **Generation History**: View and manage all your generated babies
- 🐳 **Docker Ready**: Fully containerized application

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Drizzle ORM
- **AI**: Google Gemini 2.5 Flash Image Preview
- **Frontend**: Single HTML file with Tailwind CSS
- **Package Manager**: pnpm
- **Containerization**: Docker

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Google Gemini API key
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd baby-generator
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Database Setup

Generate and run database migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Build and Run

For development with hot reload:

```bash
pnpm dev
```

For production build:

```bash
pnpm build
pnpm start
```

### 5. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- API Health Check: http://localhost:3000/api/health

## Docker Deployment

### Using Docker Compose (Recommended)

1. Create a `.env` file with your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Run with Docker Compose:
```bash
docker compose up -d
```

### Using Docker Build

```bash
# Build the image
docker build -t baby-generator .

# Run the container
docker run -d \
  --name baby-generator \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_gemini_api_key_here \
  -v $(pwd)/database.sqlite:/app/database.sqlite \
  baby-generator
```

## API Endpoints

### Generate Baby Image
```http
POST /api/generate
Content-Type: application/json

{
  "motherImage": "data:image/png;base64,<base64_string>", // optional
  "fatherImage": "data:image/png;base64,<base64_string>", // optional
  "babyImage": "data:image/png;base64,<base64_string>",   // optional
  "ultrasoundImage": "data:image/png;base64,<base64_string>", // optional
  "age": 6,
  "ageUnit": "months", // "months" or "years"
  "gender": "male",    // "male", "female", or null
  "weight": "normal"   // "light", "normal", "heavy", or null
}
```

### Age Extrapolation
```http
POST /api/extrapolate
Content-Type: application/json

{
  "generationId": "generation_id",
  "newAge": 12,
  "newAgeUnit": "months"
}
```

### Get Generation History
```http
GET /api/history
```

### Delete Generation
```http
DELETE /api/history/:id
```

## Database Schema

### Generations Table
- `id`: Unique identifier
- `motherImage`: Base64 encoded mother image
- `fatherImage`: Base64 encoded father image
- `babyImage`: Base64 encoded existing baby image
- `ultrasoundImage`: Base64 encoded ultrasound image
- `gender`: Baby gender specification
- `age`: Baby age
- `ageUnit`: Age unit (months/years)
- `generatedImage`: Generated baby image (base64)
- `weight`: Weight specification
- `prompt`: AI generation prompt
- `createdAt`: Timestamp

### Age Progressions Table
- `id`: Unique identifier
- `generationId`: Reference to parent generation
- `newAge`: Target age for progression
- `newAgeUnit`: Age unit for progression
- `progressedImage`: Age-progressed image (base64)
- `createdAt`: Timestamp

## Development Scripts

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate database migrations
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Project Structure

```
baby-generator/
├── src/
│   ├── db/
│   │   ├── index.ts          # Database connection and initialization
│   │   └── schema.ts         # Database schema definitions
│   ├── services/
│   │   └── geminiService.ts  # Google Gemini AI integration
│   ├── types.ts              # TypeScript type definitions
│   └── server.ts             # Express server and API routes
├── public/
│   └── index.html            # Frontend application (single file)
├── dist/                     # Compiled JavaScript output
├── database.sqlite           # SQLite database file
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features Explained

### Image Upload
- Supports drag-and-drop interface
- All image uploads are optional
- Images are converted to base64 for storage and API transmission
- Supports common image formats (PNG, JPG, GIF, etc.)

### Baby Generation
- Uses Google Gemini 2.5 Flash Image Preview model
- Combines facial features from parent images
- Respects age, gender, and weight specifications
- Generates high-quality, photorealistic results

### Age Progression
- Extrapolates generated babies to different ages
- Maintains facial characteristics during progression
- Supports both months and years
- Creates realistic age transitions

### History Management
- Stores all generations in SQLite database
- Displays generation parameters and timestamps
- Shows age progressions for each generation
- Allows deletion of unwanted generations

## Troubleshooting

### Common Issues

1. **Gemini API Key Error**
   - Ensure your API key is valid and has proper permissions
   - Check that the `.env` file is properly configured

2. **Database Connection Issues**
   - Run `pnpm db:generate` to create migration files
   - Ensure SQLite file permissions are correct

3. **Image Upload Problems**
   - Check file size limits (default: 50MB)
   - Ensure image formats are supported
   - Verify network connectivity for large uploads

4. **Docker Build Failures**
   - Ensure Docker daemon is running
   - Check that all required files are present
   - Verify environment variables are set

### Performance Tips

- Large images may take longer to process
- Generation typically takes 10-30 seconds depending on complexity
- Consider image compression for better performance
- Use appropriate age specifications for realistic results

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check Docker logs: `docker compose logs baby-generator`
4. Open an issue on GitHub with detailed error information