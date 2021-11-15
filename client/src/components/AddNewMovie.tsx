import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { ADD_NEW_MOVIE_URL, currentYear, GET_DIRECTORS_URL, GET_LANGUAGES_URL, GET_MOVIE_DETAILS_URL, MenuProps } from '../helper/config';
import {
  Box, Button, Checkbox, FormControl, FormHelperText, InputLabel, ListItemText,
  MenuItem, OutlinedInput, Select, TextField
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { movieValidationSchema as validationSchema } from '../helper/validationScehmas';

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
  url: ''
};

export const AddNewMovie = (props:AddMovieAttributes) => {
  const { selectedMovie } = props;
  const [languageData, setLanguageData] = useState([]);
  const [directorData, setDirectorData] = useState([]);
  const [, setSelectedMovieData] = useState(null);

  const languages = axios.get(`${GET_LANGUAGES_URL}`);
  const directors = axios.get(`${GET_DIRECTORS_URL}`);
  const selectedMovieDetails = axios.get(`${GET_MOVIE_DETAILS_URL}`, { params: { movieID: selectedMovie } });
  const fetchData = () => {
    axios.all([languages, directors]).then(axios.spread((...responses) => {
      setLanguageData(responses[0].data);
      setDirectorData(responses[1].data);
    })).catch((errors) => {
      console.log(errors);
    });
  };

  const fetchSelectedMovieDetails = () => {
    axios.all([selectedMovieDetails]).then(axios.spread((...responses) => {
      if (responses[0].data) {
        setSelectedMovieData(responses[0].data);
        const { name, language, director, imdb, rottenTomatoes, url, year } = responses[0].data;
        const languageValues = language.map((element)=> element._id);
        const directorValues = director.map((element)=> element._id);
        formik.setValues({
          name,
          language: languageValues,
          director: directorValues,
          imdb,
          rottenTomatoes,
          url,
          year
        }, true);
      }
    })).catch((errors) => {
      console.log(errors);
    });
  };

  useEffect(() => {
    fetchSelectedMovieDetails();
    return () => {
    };
  }, [selectedMovie]);

  useEffect(() => {
    fetchData();
    return () => {
    };
  }, []);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      axios.post(`${ADD_NEW_MOVIE_URL}`, {
        name: formik.values.name,
        language: formik.values.language,
        director: formik.values.director,
        imdb: formik.values.imdb,
        rottenTomatoes: formik.values.rottenTomatoes,
        year: formik.values.year,
        url: formik.values.url
      })
          .then(function(response) {
          })
          .catch(function(response) {
            console.log(response);
          });
    }
  });
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
              const selectedLanguages = (languageData.filter((language) => selected.includes(language._id))).map((element) => element.name);
              return selectedLanguages.join(', ');
            }
            }
            MenuProps={MenuProps}
          >

            {languageData.map((language) => (
              <MenuItem key={language._id} value={language._id}>
                <Checkbox checked={formik.values.language.indexOf(language._id) > -1} />
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
                const selectedDirectors = (directorData.filter(
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

            {directorData.map((director) => (
              <MenuItem key={director._id} value={director._id}>
                <Checkbox checked={formik.values.director.indexOf(director._id) > -1} />
                <ListItemText primary={director.name} />
              </MenuItem>
            ))}
          </TextField>
          {/* </Select> */}
          {/* <FormHelperText>{formik.touched.director && formik.errors.director}</FormHelperText> */}
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

