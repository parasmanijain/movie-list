const API_URL = 'http://localhost:4100';

export const ADD_NEW_COUNTRY_URL = API_URL + '/country';
export const ADD_NEW_DIRECTOR_URL = API_URL + '/director';
export const ADD_NEW_LANGUAGE_URL = API_URL + '/language';
export const ADD_NEW_MOVIE_URL = API_URL + '/movie';

export const GET_MOVIES_URL = API_URL + '/movies';
export const GET_COUNTRIES_URL = API_URL + '/countries';
export const GET_LANGUAGES_URL = API_URL + '/languages';
export const GET_DIRECTORS_URL = API_URL + '/directors';

export const GET_DIRECTORS_COUNT_URL = API_URL + '/directorsCount';
export const GET_LANGUAGES_COUNT_URL = API_URL + '/languagesCount';

export const GET_TOP_RATED_MOVIE_URL = API_URL + '/topMovie';
export const GET_TOP_DIRECTOR_URL = API_URL + '/topDirector';
export const GET_TOP_LANGUAGE_URL = API_URL + '/topLanguage';
export const GET_TOP_YEAR_URL = API_URL + '/topYear';

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

