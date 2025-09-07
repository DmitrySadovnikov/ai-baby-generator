import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { db, initializeDatabase, generations, ageProgressions } from './db';
import { GeminiService } from './services/geminiService';
import { GenerateBabyRequest, ExtrapolateAgeRequest, HistoryItem } from './types';
import { eq } from 'drizzle-orm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const geminiService = new GeminiService();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (the frontend HTML)
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate baby image
app.post('/api/generate', async (req, res) => {
  try {
    const params: GenerateBabyRequest = req.body;

    // Validate required fields
    if (!params.age || !params.ageUnit) {
      return res.status(400).json({ error: 'Age and age unit are required' });
    }

    // Generate the baby image using Gemini
    const result = await geminiService.generateBabyImage(params);

    // Save to database
    const [generation] = await db.insert(generations).values({
      motherImage: params.motherImage || null,
      fatherImage: params.fatherImage || null,
      babyImage: params.babyImage || null,
      ultrasoundImage: params.ultrasoundImage || null,
      gender: params.gender || null,
      age: params.age,
      ageUnit: params.ageUnit,
      weight: params.weight || null,
      generatedImage: result.image,
      prompt: result.prompt,
    }).returning();

    res.json({
      id: generation.id,
      generatedImage: `data:image/png;base64,${result.image}`,
      prompt: result.prompt,
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate baby image' });
  }
});

// Extrapolate age from existing generation
app.post('/api/extrapolate', async (req, res) => {
  try {
    const params: ExtrapolateAgeRequest = req.body;

    if (!params.generationId || !params.newAge || !params.newAgeUnit) {
      return res.status(400).json({ error: 'Generation ID, new age, and age unit are required' });
    }

    // Get the original generation
    const [originalGeneration] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, params.generationId));

    if (!originalGeneration) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Extrapolate the age using the original generated image
    const progressedImage = await geminiService.extrapolateAge(
      `data:image/png;base64,${originalGeneration.generatedImage}`,
      params.newAge,
      params.newAgeUnit
    );

    // Save the progression
    const [progression] = await db.insert(ageProgressions).values({
      generationId: params.generationId,
      newAge: params.newAge,
      newAgeUnit: params.newAgeUnit,
      progressedImage: progressedImage,
    }).returning();

    res.json({
      id: progression.id,
      progressedImage: `data:image/png;base64,${progressedImage}`,
    });
  } catch (error) {
    console.error('Extrapolation error:', error);
    res.status(500).json({ error: 'Failed to extrapolate age' });
  }
});

// Get generation history
app.get('/api/history', async (req, res) => {
  try {
    const generationsData = await db
      .select()
      .from(generations)
      .orderBy(generations.createdAt);

    const history: HistoryItem[] = await Promise.all(
      generationsData.map(async (gen) => {
        // Get progressions for this generation
        const progressions = await db
          .select()
          .from(ageProgressions)
          .where(eq(ageProgressions.generationId, gen.id))
          .orderBy(ageProgressions.createdAt);

        return {
          id: gen.id,
          generatedImage: `data:image/png;base64,${gen.generatedImage}`,
          age: gen.age,
          ageUnit: gen.ageUnit,
          gender: gen.gender || undefined,
          weight: gen.weight || undefined,
          createdAt: gen.createdAt || 0,
          progressions: (progressions ?? []).map((prog: any): {
            id: string;
            progressedImage: string;
            newAge: number;
            newAgeUnit: string;
            createdAt: number;
          } => ({
            id: prog.id,
            progressedImage: `data:image/png;base64,${prog.progressedImage}`,
            newAge: prog.newAge,
            newAgeUnit: prog.newAgeUnit,
            createdAt: prog.createdAt ?? 0,
          })),
        };
      })
    );

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Delete a generation
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete progressions first (foreign key constraint)
    await db.delete(ageProgressions).where(eq(ageProgressions.generationId, id));

    // Delete the generation
    await db.delete(generations).where(eq(generations.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete generation' });
  }
});

// Serve the main HTML file for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Baby Generator server running on port ${port}`);
      console.log(`Frontend available at: http://localhost:${port}`);
      console.log(`API available at: http://localhost:${port}/api/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();