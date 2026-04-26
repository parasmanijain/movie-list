export interface Movie {
  _id: string;
  name: string;
  language: string[];
  director: string[];
  year: string;
  url: string;
  imdb: string;
  rottenTomatoes?: string;
  franchise?: string;
  genre: string[];
  category?: string[];
}
