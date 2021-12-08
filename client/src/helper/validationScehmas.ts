import * as yup from 'yup';

// eslint-disable-next-line max-len
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

export const languageValidationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  code: yup
      .string()
      .required('Code is required').min(2)
});

export const movieValidationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  language: yup
      .array()
      .required('Language is required'),
  director: yup
      .array()
      .required('Director is required'),
  imdb: yup
      .string()
      .required('IMDB Rating is required'),
  rottenTomatoes: yup
      .string(),
  year: yup
      .string()
      .required('Year of Release is required'),
  url: yup
      .string()
      .matches(URL_REGEX)
      .required('URL is required'),
  genre: yup
      .array()
      .required('Language is required'),
  franchise: yup
      .string()
});

export const countryValidationSchema = yup.object({
  name: yup
      .string()
      .required('Country is required')
});

export const genreValidationSchema = yup.object({
  name: yup
      .string()
      .required('Genre is required')
});

export const franchiseValidationSchema = yup.object({
  name: yup
      .string()
      .required('Franchise is required'),
  universe: yup
      .string()
});

export const universeValidationSchema = yup.object({
  name: yup
      .string()
      .required('Universe is required')
});


export const directorValidationSchema = yup.object({
  name: yup
      .string()
      .required('Name is required'),
  url: yup
      .string()
      .matches(URL_REGEX)
      .required('URL is required'),
  country: yup
      .array()
      .required('Country is required')
});


