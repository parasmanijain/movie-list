import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import 'react-datetime/css/react-datetime.css';
import { API_URL, currentYear, MenuProps, URL_REGEX } from '../helper/config';
import * as yup from 'yup';
import { Box, Button, Checkbox, FormControl, FormHelperText, InputLabel, ListItemText,
  MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/lab';

import AdapterDateFns from '@mui/lab/AdapterDateFns';

const validationSchema = yup.object({
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
      .required('URL is required')
});


export const AddNewMovie = () => {
  const [languageData, setLanguageData] = useState([]);
  const [directorData, setDirectorData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      language: [],
      director: [],
      imdb: '',
      rottenTomatoes: '',
      year: currentYear,
      url: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      axios.post(`${API_URL}/movie`, {
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
  const fetchData = () => {
    const languages = axios.get(`${API_URL}/languages`);
    const directors = axios.get(`${API_URL}/directors`);
    axios.all([languages, directors]).then(axios.spread((...responses) => {
      setLanguageData(responses[0].data);
      setDirectorData(responses[1].data);
    })).catch((errors) => {
      console.log(errors);
    });
  };
  useEffect(() => {
    fetchData();
    return () => {
    };
  }, []);

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
            renderValue={(selected:string[]) => {
              const selectedLanguages = (languageData.filter((language)=> selected.includes(language._id))).map((element)=> element.name);
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
              renderValue: (selected:string[]) => {
                const selectedDirectors = (directorData.filter((director)=> selected.includes(director._id))).map((element)=> element.name);
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

