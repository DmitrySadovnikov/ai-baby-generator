import { GenerateBabyRequest } from '../types';

export class GeminiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }
  }

  async generateBabyImage(params: GenerateBabyRequest): Promise<{ image: string; prompt: string }> {
    const parts: any[] = [];

    // Create age description
    let ageDescription = '';
    if (params.ageUnit === 'months') {
      ageDescription = params.age <= 12 ? `${params.age} months old baby` : '1 year old baby';
    } else {
      ageDescription = params.age <= 16 ? `${params.age} year old child` : `${params.age} years old person`;
    }

    // Build weight modifier
    const weightModifier = params.weight === 'light' ? 'thin and light' :
                          params.weight === 'heavy' ? 'chubby and well-fed' : 'healthy weight';

    const systemPrompt = `Generate a realistic photo of a ${ageDescription} that combines the facial features and characteristics from the parent photos. The image should be:
- High quality, photorealistic
- Natural lighting and composition
- Clear facial features
- Appropriate age characteristics for ${ageDescription}
- Natural skin tone blending from the parents
- Professional portrait style
- ${weightModifier} appearance
${params.gender ? `- Gender: ${params.gender}` : ''}
${params.babyImage ? '- Use the existing baby photo as reference for current features and age-progress accordingly' : ''}
${params.ultrasoundImage ? '- Consider the ultrasound image as additional reference for facial structure' : ''}`;

    parts.push({ text: systemPrompt });

    // Add images to parts
    if (params.motherImage) {
      parts.push({
        inlineData: {
          mime_type: 'image/png',
          data: params.motherImage.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    if (params.fatherImage) {
      parts.push({
        inlineData: {
          mime_type: 'image/png',
          data: params.fatherImage.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    if (params.babyImage) {
      parts.push({
        inlineData: {
          mime_type: 'image/png',
          data: params.babyImage.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    if (params.ultrasoundImage) {
      parts.push({
        inlineData: {
          mime_type: 'image/png',
          data: params.ultrasoundImage.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    const requestBody = {
      contents: [
        {
          parts: parts
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}/gemini-2.5-flash-image-preview:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();

      console.log('Gemini generation raw response:', response);
      console.log('Gemini generation response:', data);
      console.log('content:', data.candidates?.[0]?.content);

      // Find the image part in the response
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData
      );
      console.log('imagePart:', imagePart);

      if (!imagePart?.inlineData?.data) {
        throw new Error('No image generated in response');
      }

      return {
        image: imagePart.inlineData.data,
        prompt: systemPrompt
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate baby image');
    }
  }

  async extrapolateAge(originalImage: string, newAge: number, newAgeUnit: 'months' | 'years'): Promise<string> {
    let ageDescription = '';
    if (newAgeUnit === 'months') {
      ageDescription = newAge <= 12 ? `${newAge} months old baby` : '1 year old baby';
    } else {
      ageDescription = newAge <= 16 ? `${newAge} year old child` : `${newAge} years old person`;
    }

    const systemPrompt = `Transform this person to show how they would look as a ${ageDescription}. The image should be:
- High quality, photorealistic
- Maintain the same facial features and characteristics
- Natural aging/growth progression
- Appropriate age characteristics for ${ageDescription}
- Same lighting and composition style
- Professional portrait style
- Natural and realistic transformation`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mime_type: 'image/png',
                data: originalImage.replace(/^data:image\/[a-z]+;base64,/, ''),
              },
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}/gemini-2.5-flash-image-preview:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();

      console.log('Gemini generation raw response:', response);
      console.log('Gemini extrapolation response:', data);
      console.log('content:', data.candidates?.[0]?.content);

      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData
      );
      console.log('imagePart:', imagePart);

      if (!imagePart?.inlineData?.data) {
        throw new Error('No image generated in response');
      }

      return imagePart.inlineData.data;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to extrapolate age');
    }
  }
}