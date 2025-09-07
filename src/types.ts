export interface GenerateBabyRequest {
  motherImage?: string; // base64
  fatherImage?: string; // base64
  babyImage?: string; // base64
  ultrasoundImage?: string; // base64
  gender?: 'male' | 'female';
  age: number;
  ageUnit: 'months' | 'years';
  weight?: 'light' | 'normal' | 'heavy';
}

export interface GenerateBabyResponse {
  id: string;
  generatedImage: string; // base64
  prompt: string;
}

export interface ExtrapolateAgeRequest {
  generationId: string;
  newAge: number;
  newAgeUnit: 'months' | 'years';
}

export interface ExtrapolateAgeResponse {
  id: string;
  progressedImage: string; // base64
}

export interface HistoryItem {
  id: string;
  generatedImage: string;
  age: number;
  ageUnit: string;
  gender?: string;
  weight?: string;
  createdAt: number;
  progressions?: {
    id: string;
    progressedImage: string;
    newAge: number;
    newAgeUnit: string;
    createdAt: number;
  }[];
}