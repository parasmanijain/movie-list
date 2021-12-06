import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import {
  ADD_NEW_MOVIE_URL, currentYear, GET_DIRECTORS_URL, GET_FRANCHISES_URL,
  GET_GENRES_URL, GET_LANGUAGES_URL, GET_MOVIE_DETAILS_URL, GET_UNIVERSES_URL, MenuProps, UPDATE_EXISTING_MOVIE_URL
} from '../helper/config';
import { FormHelperText, ListSubheader, OutlinedInput } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { movieValidationSchema as validationSchema } from '../helper/validationScehmas';
import { Box, Button, TextField, Select, CheckBox, FormControl, InputLabel, MenuItem, ListItemText, Divider } from '../lib';

interface AddMovieAttributes {
  selectedMovie?: string;
}

const initialValues = {
  name: '',
  language: [],
  director: [],
  imdb: '',
  rottenTomatoes: '',
  year: currentYear,
  url: '',
  genre: [],
  franchise: ''
};

export const AddNewMovie = (props: AddMovieAttributes) => {
  const { selectedMovie } = props;
  const [languageData, setLanguageData] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [directorData, setDirectorData] = useState([]);
  const [existingValues, setExistingValues] = useState({});
  const [, setSelectedMovieData] = useState(null);

  const fetchData = () => {
    const languages = axios.get(`${GET_LANGUAGES_URL}`);
    const directors = axios.get(`${GET_DIRECTORS_URL}`);
    const genres = axios.get(`${GET_GENRES_URL}`);
    const franchises = axios.get(`${GET_FRANCHISES_URL}`);
    const universes = axios.get(`${GET_UNIVERSES_URL}`);
    axios.all([languages, directors, genres, universes, franchises]).then(axios.spread((...responses) => {
      setLanguageData(responses[0].data);
      setDirectorData(responses[1].data);
      setGenreData(responses[2].data);
      const arr = [...responses[3].data, ...responses[4].data];
      setFranchiseData(arr);
      fetchSelectedMovieDetails(arr);
    })).catch((errors) => {
      console.log(errors);
    });
  };

  const fetchSelectedMovieDetails = (arr) => {
    const selectedMovieDetails = axios.get(`${GET_MOVIE_DETAILS_URL}`, { params: { movieID: selectedMovie } });
    axios.all([selectedMovieDetails]).then(axios.spread((...responses) => {
      if (responses[0].data) {
        setSelectedMovieData(responses[0].data);
        const { name, language, director, imdb, rottenTomatoes, url, year, genre, franchise } = responses[0].data;
        const languageValues = language.map((element) => element._id);
        const directorValues = director.map((element) => element._id);
        const genreValues = genre.map((element) => element._id);
        let franchiseValue;
        if (franchise.universe) {
          franchiseValue = (arr.find((ele)=> ele._id === franchise.universe)).franchises.filter((x)=> x._id=== franchise._id);
        }
        const obj = {
          name,
          language: languageValues,
          director: directorValues,
          imdb,
          rottenTomatoes,
          url,
          year,
          genre: genreValues,
          franchise: franchise? franchiseValue[0]._id: ''
        };
        formik.setValues(obj, true);
        setExistingValues(obj);
      }
    })).catch((errors) => {
      console.log(errors);
    });
  };


  useEffect(() => {
    fetchData();
    if (selectedMovie) {

    }
    return () => {
    };
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      let apiURL = '';
      let request = {};
      if (selectedMovie) {
        apiURL = UPDATE_EXISTING_MOVIE_URL;
        const diff = _.reduce(existingValues, (result, value, key) =>
         _.isEqual(value, formik.values[key]) ? result : result.concat(key), []);
        const arrkeys= ['language', 'director', 'genre'];
        diff.forEach((ele)=> {
          let obj = {};
          if (arrkeys.includes(ele)) {
            const removed = existingValues[ele]
                .filter((x) => !formik.values[ele].includes(x));
            const added = formik.values[ele]
                .filter((x) => !existingValues[ele].includes(x));
            obj = {
              [ele]: {
                added,
                removed
              }
            };
          } else if (ele==='franchise') {
            obj = {
              [ele]: {
                'current': existingValues[ele],
                'new': formik.values[ele]
              }
            };
          } else {
            obj = {
              [ele]: formik.values[ele]
            };
          }
          request = { ...request, ...obj };
        });
      } else {
        apiURL = ADD_NEW_MOVIE_URL;
        request = {
          name: formik.values.name,
          language: formik.values.language,
          director: formik.values.director,
          imdb: formik.values.imdb,
          rottenTomatoes: formik.values.rottenTomatoes,
          year: formik.values.year,
          url: formik.values.url,
          genre: formik.values.genre,
          franchise: formik.values.franchise
        };
      }
      axios.post(apiURL, request)
          .then(function(response) {
            resetForm();
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });

  const makeItems = (data) => {
    const items = [];
    data.forEach((element, index)=> {
      if (element.franchises) {
        items.push(<ListSubheader key={element._id + index}>{element.name}</ListSubheader>);
        element.franchises.forEach((franchise)=> {
          items.push(
              <MenuItem key={franchise._id} value={franchise._id}>
                {franchise.name}
              </MenuItem>
          );
        });
        items.push(<Divider key={index} />);
      } else {
        items.push(
            <MenuItem key={element._id + index} value={element._id}>
              {element.name}
            </MenuItem>
        );
      }
    });
    return items;
  };
  return (
    <form id="form" onSubmit={formik.handleSubmit} autoComplete="off">
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Movie"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="language-multiple-checkbox-label">Language</InputLabel>
          <Select
            labelId="language-multiple-checkbox-label"
            id="language-multiple-checkbox"
            multiple
            name="language"
            value={formik.values.language}
            onChange={formik.handleChange}
            error={formik.touched.language && Boolean(formik.errors.language)}

            input={<OutlinedInput label="Language" />}
            renderValue={(selected: string[]) => {
              const selectedLanguages = ([...languageData].filter(
                  (language) => selected.includes(language._id))).map((element) => element.name);
              return selectedLanguages.join(', ');
            }
            }
            MenuProps={MenuProps}
          >

            {[...languageData].map((language) => (
              <MenuItem key={language._id} value={language._id}>
                <CheckBox checked={formik.values.language.indexOf(language._id) > -1} />
                <ListItemText primary={language.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.language && formik.errors.language}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          {/* <InputLabel id="director-multiple-checkbox-label">Director</InputLabel> */}
          <TextField
            select
            id="director"
            label="Director"
            name="director"
            SelectProps={{
              multiple: true,
              value: formik.values.director,
              onChange: formik.handleChange,
              MenuProps: MenuProps,
              error: formik.touched.director && Boolean(formik.errors.director),
              renderValue: (selected: string[]) => {
                const selectedDirectors = ([...directorData].filter(
                    (director) => selected.includes(director._id))).map((element) => element.name);
                return selectedDirectors.join(', ');
              }
            }}
            error={formik.touched.director && Boolean(formik.errors.director)}
            helperText={formik.touched.director && formik.errors.director}
          >
            {/* <Select
            labelId="director-multiple-checkbox-label"
            id="director-multiple-checkbox"
            multiple
            name="director"
            value={formik.values.director}
            onChange={formik.handleChange}
            error={formik.touched.director && Boolean(formik.errors.director)}
            isSearchable={true}

            input={<OutlinedInput label="Director" />}
            renderValue={(selected:string[]) => {
              const selectedDirectors = (directorData.filter((director)=> selected.includes(director._id))).map((element)=> element.name);
              return selectedDirectors.join(', ');
            }
            }
            MenuProps={MenuProps}
          > */}

            {[...directorData].map((director) => (
              <MenuItem key={director._id} value={director._id}>
                <CheckBox checked={formik.values.director.indexOf(director._id) > -1} />
                <ListItemText primary={director.name} />
              </MenuItem>
            ))}
          </TextField>
          {/* </Select> */}
          {/* <FormHelperText>{formik.touched.director && formik.errors.director}</FormHelperText> */}
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="genre-multiple-checkbox-label">Genre</InputLabel>
          <Select
            labelId="genre-multiple-checkbox-label"
            id="genre-multiple-checkbox"
            multiple
            name="genre"
            value={formik.values.genre}
            onChange={formik.handleChange}
            error={formik.touched.genre && Boolean(formik.errors.genre)}

            input={<OutlinedInput label="Genre" />}
            renderValue={(selected: string[]) => {
              const selectedGenres = ([...genreData].filter(
                  (genre) => selected.includes(genre._id))).map((element) => element.name);
              return selectedGenres.join(', ');
            }
            }
            MenuProps={MenuProps}
          >
            {[...genreData].map((genre) => (
              <MenuItem key={genre._id} value={genre._id}>
                <CheckBox checked={formik.values.genre.indexOf(genre._id) > -1} />
                <ListItemText primary={genre.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.language && formik.errors.language}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="franchise-label">Franchise</InputLabel>
          <Select
            labelId="franchise-label"
            id="franchise"
            name="franchise"
            value={formik.values.franchise}
            onChange={formik.handleChange}
            error={formik.touched.franchise && Boolean(formik.errors.franchise)}
            input={<OutlinedInput label="Franchise" />}
            MenuProps={MenuProps}
          >
            {makeItems([...franchiseData])}
          </Select>
          <FormHelperText>{formik.touched.franchise && formik.errors.franchise}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="imdb"
            name="imdb"
            label="IMDB Rating"
            value={formik.values.imdb}
            onChange={formik.handleChange}
            error={formik.touched.imdb && Boolean(formik.errors.imdb)}
            helperText={formik.touched.imdb && formik.errors.imdb}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="rottenTomatoes"
            name="rottenTomatoes"
            label="Rotten Tomatoes Score"
            value={formik.values.rottenTomatoes}
            onChange={formik.handleChange}
            error={formik.touched.rottenTomatoes && Boolean(formik.errors.rottenTomatoes)}
            helperText={formik.touched.rottenTomatoes && formik.errors.rottenTomatoes}
          />
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Year"
              value={formik.values.year}
              views={['year']}
              onChange={(newValue) => {
                formik.setValues({ ...formik.values, year: (new Date(newValue).getFullYear()).toString() });
              }}
              renderInput={(params) => {
                return <TextField {...params} />;
              }
              }
            />
          </LocalizationProvider>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="url"
            name="url"
            label="URL"
            value={formik.values.url}
            onChange={formik.handleChange}
            error={formik.touched.url && Boolean(formik.errors.url)}
            helperText={formik.touched.url && formik.errors.url}
          />
        </FormControl>
        <Button color="primary" variant="contained" type="submit" sx={{ margin: 2, width: 300 }}>
          Submit
        </Button>
      </Box>
    </form>
  );
};

