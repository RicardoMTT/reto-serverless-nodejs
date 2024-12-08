import { Meal } from "./meal.interface";

export interface NewPerson {
    id: string;
    speciesId: string;
    name: string;
    classification: string;
    dietType: string;
    recommendedMeals: Meal[];
    createdAt: string;
  }