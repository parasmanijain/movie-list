export const ADD_NEW_COUNTRY_URL = '/country';
export const ADD_NEW_DIRECTOR_URL = '/director';
export const ADD_NEW_LANGUAGE_URL = '/language';
export const ADD_NEW_GENRE_URL = '/genre';
export const ADD_NEW_FRANCHISE_URL = '/franchise';
export const ADD_NEW_UNIVERSE_URL = '/universe';
export const ADD_NEW_CATEGORY_URL = '/category';
export const ADD_NEW_AWARD_URL = '/award';
export const ADD_NEW_MOVIE_URL = '/movie';
export const UPDATE_EXISTING_MOVIE_URL = '/updateMovie';

export const GET_MOVIES_URL = '/movies';
export const GET_COUNTRIES_URL = '/countries';
export const GET_LANGUAGES_URL = '/languages';
export const GET_DIRECTORS_URL = '/directors';
export const GET_GENRES_URL = '/genres';
export const GET_FRANCHISES_URL = '/franchises';
export const GET_UNIVERSES_URL = '/universes';
export const GET_CATEGORIES_URL = '/categories';
export const GET_AWARDS_URL = '/awards';
export const GET_MOVIE_DETAILS_URL = '/movieDetails';

export const GET_DIRECTORS_COUNT_URL = '/directorsCount';
export const GET_LANGUAGES_COUNT_URL = '/languagesCount';
export const GET_GENRES_COUNT_URL = '/genresCount';
export const GET_FRANCHISES_COUNT_URL = '/franchisesCount';
export const GET_UNIVERSES_COUNT_URL = '/universesCount';
export const GET_CATEGORIES_COUNT_URL = '/categoriesCount';
export const GET_AWARDS_COUNT_URL = '/awardsCount';
export const GET_YEARS_COUNT_URL = '/yearsCount';

export const GET_TOP_RATED_MOVIE_URL = '/topMovie';
export const GET_TOP_DIRECTOR_URL = '/topDirector';
export const GET_TOP_LANGUAGE_URL = '/topLanguage';
export const GET_TOP_GENRE_URL = '/topGenre';
export const GET_TOP_FRANCHISE_URL = '/topFranchise';
export const GET_TOP_CATEGORY_URL = '/topCategory';
export const GET_TOP_YEAR_URL = '/topYear';

export const ITEM_HEIGHT = 48;
export const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

export const currentYear = ((new Date()).getUTCFullYear()).toString();

