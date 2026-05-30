import { describe, it, expect } from 'vitest';
import {
  ADD_NEW_COUNTRY_URL,
  ADD_NEW_DIRECTOR_URL,
  ADD_NEW_LANGUAGE_URL,
  ADD_NEW_GENRE_URL,
  ADD_NEW_FRANCHISE_URL,
  ADD_NEW_UNIVERSE_URL,
  ADD_NEW_CATEGORY_URL,
  ADD_NEW_AWARD_URL,
  ADD_NEW_MOVIE_URL,
  UPDATE_EXISTING_MOVIE_URL,
  GET_MOVIES_URL,
  GET_COUNTRIES_URL,
  GET_LANGUAGES_URL,
  GET_DIRECTORS_URL,
  GET_GENRES_URL,
  GET_FRANCHISES_URL,
  GET_UNIVERSES_URL,
  GET_UNIVERSE_FRANCHISES_URL,
  GET_CATEGORIES_URL,
  GET_AWARDS_URL,
  GET_AWARD_CATEGORIES_URL,
  GET_MOVIE_DETAILS_URL,
  GET_MOVIE_AWARDS_URL,
  GET_DIRECTORS_COUNT_URL,
  GET_MOVIES_COUNT_URL,
  GET_LANGUAGES_COUNT_URL,
  GET_GENRES_COUNT_URL,
  GET_FRANCHISES_COUNT_URL,
  GET_UNIVERSES_COUNT_URL,
  GET_CATEGORIES_COUNT_URL,
  GET_AWARDS_COUNT_URL,
  GET_YEARS_COUNT_URL,
  GET_TOP_RATED_MOVIE_URL,
  GET_TOP_DIRECTOR_URL,
  GET_TOP_LANGUAGE_URL,
  GET_TOP_GENRE_URL,
  GET_TOP_FRANCHISE_URL,
  GET_TOP_CATEGORY_URL,
  GET_TOP_YEAR_URL,
  ITEM_HEIGHT,
  ITEM_PADDING_TOP,
  MenuProps
} from '../helper/config';

describe('config constants', () => {
  /**
   * Verifies that all ADD_NEW_* URL constants are correctly defined strings.
   */
  describe('ADD_NEW_* URL constants', () => {
    it('should export ADD_NEW_COUNTRY_URL as /country', () => {
      expect(ADD_NEW_COUNTRY_URL).toBe('/country');
    });

    it('should export ADD_NEW_DIRECTOR_URL as /director', () => {
      expect(ADD_NEW_DIRECTOR_URL).toBe('/director');
    });

    it('should export ADD_NEW_LANGUAGE_URL as /language', () => {
      expect(ADD_NEW_LANGUAGE_URL).toBe('/language');
    });

    it('should export ADD_NEW_GENRE_URL as /genre', () => {
      expect(ADD_NEW_GENRE_URL).toBe('/genre');
    });

    it('should export ADD_NEW_FRANCHISE_URL as /franchise', () => {
      expect(ADD_NEW_FRANCHISE_URL).toBe('/franchise');
    });

    it('should export ADD_NEW_UNIVERSE_URL as /universe', () => {
      expect(ADD_NEW_UNIVERSE_URL).toBe('/universe');
    });

    it('should export ADD_NEW_CATEGORY_URL as /category', () => {
      expect(ADD_NEW_CATEGORY_URL).toBe('/category');
    });

    it('should export ADD_NEW_AWARD_URL as /award', () => {
      expect(ADD_NEW_AWARD_URL).toBe('/award');
    });

    it('should export ADD_NEW_MOVIE_URL as /movie', () => {
      expect(ADD_NEW_MOVIE_URL).toBe('/movie');
    });

    it('should export UPDATE_EXISTING_MOVIE_URL as /updateMovie', () => {
      expect(UPDATE_EXISTING_MOVIE_URL).toBe('/updateMovie');
    });
  });

  /**
   * Verifies that all GET_* URL constants are correctly defined strings.
   */
  describe('GET_* URL constants', () => {
    it('should export GET_MOVIES_URL as /movies', () => {
      expect(GET_MOVIES_URL).toBe('/movies');
    });

    it('should export GET_COUNTRIES_URL as /countries', () => {
      expect(GET_COUNTRIES_URL).toBe('/countries');
    });

    it('should export GET_LANGUAGES_URL as /languages', () => {
      expect(GET_LANGUAGES_URL).toBe('/languages');
    });

    it('should export GET_DIRECTORS_URL as /directors', () => {
      expect(GET_DIRECTORS_URL).toBe('/directors');
    });

    it('should export GET_GENRES_URL as /genres', () => {
      expect(GET_GENRES_URL).toBe('/genres');
    });

    it('should export GET_FRANCHISES_URL as /franchises', () => {
      expect(GET_FRANCHISES_URL).toBe('/franchises');
    });

    it('should export GET_UNIVERSES_URL as /universes', () => {
      expect(GET_UNIVERSES_URL).toBe('/universes');
    });

    it('should export GET_UNIVERSE_FRANCHISES_URL as /universeFranchises', () => {
      expect(GET_UNIVERSE_FRANCHISES_URL).toBe('/universeFranchises');
    });

    it('should export GET_CATEGORIES_URL as /categories', () => {
      expect(GET_CATEGORIES_URL).toBe('/categories');
    });

    it('should export GET_AWARDS_URL as /awards', () => {
      expect(GET_AWARDS_URL).toBe('/awards');
    });

    it('should export GET_AWARD_CATEGORIES_URL as /awardCategories', () => {
      expect(GET_AWARD_CATEGORIES_URL).toBe('/awardCategories');
    });

    it('should export GET_MOVIE_DETAILS_URL as /movieDetails', () => {
      expect(GET_MOVIE_DETAILS_URL).toBe('/movieDetails');
    });

    it('should export GET_MOVIE_AWARDS_URL as /movieAwards', () => {
      expect(GET_MOVIE_AWARDS_URL).toBe('/movieAwards');
    });
  });

  /**
   * Verifies that all count URL constants are correctly defined.
   */
  describe('Count URL constants', () => {
    it('should export GET_DIRECTORS_COUNT_URL as /directorsCount', () => {
      expect(GET_DIRECTORS_COUNT_URL).toBe('/directorsCount');
    });

    it('should export GET_MOVIES_COUNT_URL as /moviesCount', () => {
      expect(GET_MOVIES_COUNT_URL).toBe('/moviesCount');
    });

    it('should export GET_LANGUAGES_COUNT_URL as /languagesCount', () => {
      expect(GET_LANGUAGES_COUNT_URL).toBe('/languagesCount');
    });

    it('should export GET_GENRES_COUNT_URL as /genresCount', () => {
      expect(GET_GENRES_COUNT_URL).toBe('/genresCount');
    });

    it('should export GET_FRANCHISES_COUNT_URL as /franchisesCount', () => {
      expect(GET_FRANCHISES_COUNT_URL).toBe('/franchisesCount');
    });

    it('should export GET_UNIVERSES_COUNT_URL as /universesCount', () => {
      expect(GET_UNIVERSES_COUNT_URL).toBe('/universesCount');
    });

    it('should export GET_CATEGORIES_COUNT_URL as /categoriesCount', () => {
      expect(GET_CATEGORIES_COUNT_URL).toBe('/categoriesCount');
    });

    it('should export GET_AWARDS_COUNT_URL as /awardsCount', () => {
      expect(GET_AWARDS_COUNT_URL).toBe('/awardsCount');
    });

    it('should export GET_YEARS_COUNT_URL as /yearsCount', () => {
      expect(GET_YEARS_COUNT_URL).toBe('/yearsCount');
    });
  });

  /**
   * Verifies that all GET_TOP_* URL constants are correctly defined.
   */
  describe('GET_TOP_* URL constants', () => {
    it('should export GET_TOP_RATED_MOVIE_URL as /topMovie', () => {
      expect(GET_TOP_RATED_MOVIE_URL).toBe('/topMovie');
    });

    it('should export GET_TOP_DIRECTOR_URL as /topDirector', () => {
      expect(GET_TOP_DIRECTOR_URL).toBe('/topDirector');
    });

    it('should export GET_TOP_LANGUAGE_URL as /topLanguage', () => {
      expect(GET_TOP_LANGUAGE_URL).toBe('/topLanguage');
    });

    it('should export GET_TOP_GENRE_URL as /topGenre', () => {
      expect(GET_TOP_GENRE_URL).toBe('/topGenre');
    });

    it('should export GET_TOP_FRANCHISE_URL as /topFranchise', () => {
      expect(GET_TOP_FRANCHISE_URL).toBe('/topFranchise');
    });

    it('should export GET_TOP_CATEGORY_URL as /topCategory', () => {
      expect(GET_TOP_CATEGORY_URL).toBe('/topCategory');
    });

    it('should export GET_TOP_YEAR_URL as /topYear', () => {
      expect(GET_TOP_YEAR_URL).toBe('/topYear');
    });
  });

  /**
   * Verifies that ITEM_HEIGHT and ITEM_PADDING_TOP are numeric constants.
   */
  describe('Menu dimension constants', () => {
    it('should export ITEM_HEIGHT as 72', () => {
      expect(ITEM_HEIGHT).toBe(72);
    });

    it('should export ITEM_PADDING_TOP as 8', () => {
      expect(ITEM_PADDING_TOP).toBe(8);
    });

    /**
     * Verifies that MenuProps is an object with slotProps.paper.style containing
     * maxHeight and width properties.
     */
    it('should export MenuProps with correct shape', () => {
      expect(MenuProps).toBeDefined();
      expect(MenuProps.slotProps.paper.style.maxHeight).toBe(ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP);
      expect(MenuProps.slotProps.paper.style.width).toBe(250);
    });
  });
});
