import { describe, it, expect } from 'vitest';
import {
  languageValidationSchema,
  movieValidationSchema,
  countryValidationSchema,
  genreValidationSchema,
  franchiseValidationSchema,
  universeValidationSchema,
  directorValidationSchema,
  categoryValidationSchema,
  awardValidationSchema
} from '../helper/validationScehmas';

// ─── languageValidationSchema ───────────────────────────────────────────────────
describe('languageValidationSchema', () => {
  /**
   * Verifies that a valid language object with name and code (min 2 chars) passes validation.
   */
  it('should pass validation with valid name and code', async () => {
    await expect(
      languageValidationSchema.validate({ name: 'English', code: 'en' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      languageValidationSchema.validate({ code: 'en' })
    ).rejects.toThrow('Name is required');
  });

  /**
   * Verifies that validation fails when code is missing.
   */
  it('should fail when code is missing', async () => {
    await expect(
      languageValidationSchema.validate({ name: 'English' })
    ).rejects.toThrow('Code is required');
  });

  /**
   * Verifies that validation fails when code is shorter than 2 characters.
   */
  it('should fail when code is shorter than 2 characters', async () => {
    await expect(
      languageValidationSchema.validate({ name: 'English', code: 'e' })
    ).rejects.toThrow();
  });

  /**
   * Verifies that validation passes when code is exactly 2 characters.
   */
  it('should pass when code is exactly 2 characters', async () => {
    await expect(
      languageValidationSchema.validate({ name: 'English', code: 'en' })
    ).resolves.toBeDefined();
  });
});

// ─── movieValidationSchema ─────────────────────────────────────────────────────
describe('movieValidationSchema', () => {
  const validMovie = {
    name: 'Inception',
    language: ['en'],
    director: ['dir1'],
    imdb: '8.8',
    year: '2010',
    url: 'https://www.imdb.com/title/tt1375666',
    genre: ['Action']
  };

  /**
   * Verifies that a valid movie object passes validation.
   */
  it('should pass validation with all required fields', async () => {
    await expect(movieValidationSchema.validate(validMovie)).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    const { name, ...rest } = validMovie;
    await expect(movieValidationSchema.validate(rest)).rejects.toThrow('Name is required');
  });

  /**
   * Verifies that validation fails when imdb is missing.
   */
  it('should fail when imdb is missing', async () => {
    const { imdb, ...rest } = validMovie;
    await expect(movieValidationSchema.validate(rest)).rejects.toThrow('IMDB Rating is required');
  });

  /**
   * Verifies that validation fails when url is missing.
   */
  it('should fail when url is missing', async () => {
    const { url, ...rest } = validMovie;
    await expect(movieValidationSchema.validate(rest)).rejects.toThrow();
  });

  /**
   * Verifies that validation fails when url does not match the URL regex pattern.
   */
  it('should fail when url does not match URL regex', async () => {
    await expect(
      movieValidationSchema.validate({ ...validMovie, url: 'not-a-url' })
    ).rejects.toThrow();
  });

  /**
   * Verifies that rottenTomatoes is optional and validation passes without it.
   */
  it('should pass when rottenTomatoes is omitted (optional field)', async () => {
    await expect(movieValidationSchema.validate(validMovie)).resolves.toBeDefined();
  });

  /**
   * Verifies that franchise is optional and validation passes without it.
   */
  it('should pass when franchise is omitted (optional field)', async () => {
    await expect(movieValidationSchema.validate(validMovie)).resolves.toBeDefined();
  });
});

// ─── countryValidationSchema ───────────────────────────────────────────────────
describe('countryValidationSchema', () => {
  /**
   * Verifies that a valid country object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      countryValidationSchema.validate({ name: 'France' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      countryValidationSchema.validate({})
    ).rejects.toThrow('Country is required');
  });

  /**
   * Verifies that validation fails when name is an empty string.
   */
  it('should fail when name is an empty string', async () => {
    await expect(
      countryValidationSchema.validate({ name: '' })
    ).rejects.toThrow('Country is required');
  });
});

// ─── genreValidationSchema ─────────────────────────────────────────────────────
describe('genreValidationSchema', () => {
  /**
   * Verifies that a valid genre object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      genreValidationSchema.validate({ name: 'Action' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      genreValidationSchema.validate({})
    ).rejects.toThrow('Genre is required');
  });

  /**
   * Verifies that validation fails when name is an empty string.
   */
  it('should fail when name is an empty string', async () => {
    await expect(
      genreValidationSchema.validate({ name: '' })
    ).rejects.toThrow('Genre is required');
  });
});

// ─── franchiseValidationSchema ─────────────────────────────────────────────────
describe('franchiseValidationSchema', () => {
  /**
   * Verifies that a valid franchise object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      franchiseValidationSchema.validate({ name: 'The Dark Knight' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that a franchise with optional universe field passes validation.
   */
  it('should pass validation with name and optional universe', async () => {
    await expect(
      franchiseValidationSchema.validate({ name: 'The Dark Knight', universe: 'DC' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      franchiseValidationSchema.validate({})
    ).rejects.toThrow('Franchise is required');
  });
});

// ─── universeValidationSchema ───────────────────────────────────────────────────
describe('universeValidationSchema', () => {
  /**
   * Verifies that a valid universe object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      universeValidationSchema.validate({ name: 'Marvel Cinematic Universe' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      universeValidationSchema.validate({})
    ).rejects.toThrow('Universe is required');
  });

  /**
   * Verifies that validation fails when name is an empty string.
   */
  it('should fail when name is an empty string', async () => {
    await expect(
      universeValidationSchema.validate({ name: '' })
    ).rejects.toThrow('Universe is required');
  });
});

// ─── directorValidationSchema ───────────────────────────────────────────────────
describe('directorValidationSchema', () => {
  const validDirector = {
    name: 'Christopher Nolan',
    url: 'https://www.imdb.com/name/nm0634240',
    country: ['UK']
  };

  /**
   * Verifies that a valid director object passes validation.
   */
  it('should pass validation with all required fields', async () => {
    await expect(
      directorValidationSchema.validate(validDirector)
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    const { name, ...rest } = validDirector;
    await expect(
      directorValidationSchema.validate(rest)
    ).rejects.toThrow('Name is required');
  });

  /**
   * Verifies that validation fails when url is missing.
   */
  it('should fail when url is missing', async () => {
    const { url, ...rest } = validDirector;
    await expect(
      directorValidationSchema.validate(rest)
    ).rejects.toThrow();
  });

  /**
   * Verifies that validation fails when url does not match the URL regex pattern.
   */
  it('should fail when url does not match URL regex', async () => {
    await expect(
      directorValidationSchema.validate({ ...validDirector, url: 'not-a-url' })
    ).rejects.toThrow();
  });

  /**
   * Verifies that validation fails when country is missing.
   */
  it('should fail when country is missing', async () => {
    const { country, ...rest } = validDirector;
    await expect(
      directorValidationSchema.validate(rest)
    ).rejects.toThrow('Country is required');
  });
});

// ─── categoryValidationSchema ───────────────────────────────────────────────────
describe('categoryValidationSchema', () => {
  /**
   * Verifies that a valid category object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      categoryValidationSchema.validate({ name: 'Best Picture' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that a category with optional award field passes validation.
   */
  it('should pass validation with name and optional award', async () => {
    await expect(
      categoryValidationSchema.validate({ name: 'Best Picture', award: 'Academy Award' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      categoryValidationSchema.validate({})
    ).rejects.toThrow('Category is required');
  });

  /**
   * Verifies that validation fails when name is an empty string.
   */
  it('should fail when name is an empty string', async () => {
    await expect(
      categoryValidationSchema.validate({ name: '' })
    ).rejects.toThrow('Category is required');
  });
});

// ─── awardValidationSchema ─────────────────────────────────────────────────────
describe('awardValidationSchema', () => {
  /**
   * Verifies that a valid award object with name passes validation.
   */
  it('should pass validation with a valid name', async () => {
    await expect(
      awardValidationSchema.validate({ name: 'Academy Award' })
    ).resolves.toBeDefined();
  });

  /**
   * Verifies that validation fails when name is missing.
   */
  it('should fail when name is missing', async () => {
    await expect(
      awardValidationSchema.validate({})
    ).rejects.toThrow('Award is required');
  });

  /**
   * Verifies that validation fails when name is an empty string.
   */
  it('should fail when name is an empty string', async () => {
    await expect(
      awardValidationSchema.validate({ name: '' })
    ).rejects.toThrow('Award is required');
  });
});
