import { useState, useEffect, type JSX } from 'react';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import axiosConfig from '../../helper/axiosConfig';
import {
  ADD_NEW_MOVIE_URL,
  GET_AWARD_CATEGORIES_URL,
  GET_DIRECTORS_URL,
  GET_FRANCHISES_URL,
  GET_GENRES_URL,
  GET_LANGUAGES_URL,
  GET_MOVIE_DETAILS_URL,
  GET_UNIVERSE_FRANCHISES_URL,
  UPDATE_EXISTING_MOVIE_URL
} from '../../helper/config';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { movieValidationSchema as validationSchema } from '../../helper/validationScehmas';
import type { Language } from '../../models/Language';
import { Box, Button, Checkbox, Divider, FormControl, FormHelperText, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import type { SelectProps } from '@mui/material/Select';

// Define MenuProps for MUI v9 compatibility
const MenuProps = {
  slotProps: {
    paper: {
      style: {
        maxHeight: 224,
        width: 250,
      },
    },
  },
};

interface IFormikValues {
  name: string;
  language: string[];
  director: string[];
  imdb: string;
  rottenTomatoes?: string;
  year: number;
  url: string;
  genre: string[];
  franchise?: string;
  category?: string[];
}

const initialValues: IFormikValues = {
  name: '',
  language: [],
  director: [],
  imdb: '',
  rottenTomatoes: '',
  year: new Date().getUTCFullYear(),
  url: '',
  genre: [],
  franchise: '',
  category: []
};

// Define proper types for the data structures
interface GenreData {
  _id: string;
  name: string;
}

interface DirectorData {
  _id: string;
  name: string;
}

interface FranchiseData {
  _id: string;
  name: string;
  franchises?: Array<{ _id: string; name: string }>;
}

interface CategoryData {
  _id: string;
  name: string;
  categories?: Array<{ _id: string; name: string }>;
}

export const AddNewMovie = (props: { selectedMovie?: string }): JSX.Element => {
  const { selectedMovie } = props;
  const [languageData, setLanguageData] = useState<Language[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [franchiseData, setFranchiseData] = useState<FranchiseData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [directorData, setDirectorData] = useState<DirectorData[]>([]);
  const [existingValues, setExistingValues] = useState<Partial<IFormikValues>>({});
  const [, setSelectedMovieData] = useState<any>(null);

  const fetchData = () => {
    const languages = axiosConfig.get(`${GET_LANGUAGES_URL}`);
    const directors = axiosConfig.get(`${GET_DIRECTORS_URL}`);
    const genres = axiosConfig.get(`${GET_GENRES_URL}`);
    const franchises = axiosConfig.get(`${GET_FRANCHISES_URL}`);
    const universes = axiosConfig.get(`${GET_UNIVERSE_FRANCHISES_URL}`);
    const awards = axiosConfig.get(`${GET_AWARD_CATEGORIES_URL}`);
    Promise.all([languages, directors, genres, universes, franchises, awards])
      .then((responses) => {
        setLanguageData(responses[0].data);
        setDirectorData(responses[1].data);
        setGenreData(responses[2].data);
        const franchiseList = [...responses[3].data, ...responses[4].data];
        setFranchiseData(franchiseList);
        setCategoryData(responses[5].data);
        if (selectedMovie) {
          fetchSelectedMovieDetails(franchiseList);
        }
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  const fetchSelectedMovieDetails = (franchiseList: any) => {
    const selectedMovieDetails = axiosConfig.get(`${GET_MOVIE_DETAILS_URL}`, {
      params: { movieID: selectedMovie }
    });
    Promise.all([selectedMovieDetails])
      .then((responses) => {
        if (responses[0].data) {
          setSelectedMovieData(responses[0].data);
          const {
            name,
            language,
            director,
            imdb,
            rottenTomatoes,
            url,
            year,
            genre,
            franchise,
            category
          } = responses[0].data;
          const languageValues: string[] = language.map(
            (element: { _id: string }) => element._id
          );
          const directorValues: string[] = director.map(
            (element: { _id: string }) => element._id
          );
          const genreValues: string[] = genre.map(
            (element: { _id: string }) => element._id
          );
          let categoryValues: string[] = [];
          if (category) {
            categoryValues = category.map((element: { _id: string }) => element._id);
          }
          let franchiseValue: { _id: string }[] = [];
          if (franchise && franchise.universe) {
            franchiseValue = franchiseList
              .find((ele: { _id: string }) => ele._id === franchise.universe)
              .franchises.filter((x: { _id: string }) => x._id === franchise._id);
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
            franchise: franchise && franchiseValue.length > 0 ? franchiseValue[0]?._id || '' : '',
            category: categoryValues
          };
          formik.setValues(obj, true);
          setExistingValues(obj);
        }
      })
      .catch((errors) => {
        console.log(errors);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      let apiURL = '';
      let request = {};
      if (selectedMovie) {
        apiURL = UPDATE_EXISTING_MOVIE_URL;
        const diff = _.reduce(
          existingValues,
          (result: string[], value, key: string | number) => {
            const formikKey = key as keyof IFormikValues;
            return _.isEqual(value, formik.values[formikKey]) ? result : result.concat(key.toString());
          },
          [] as string[]
        );
        const arrkeys = ['language', 'director', 'genre', 'category'];
        diff.forEach((ele: string) => {
          let obj = {};
          if (arrkeys.includes(ele)) {
            const eleKey = ele as keyof IFormikValues;
            const existingValue = existingValues[eleKey] as string[] || [];
            const formikValue = formik.values[eleKey] as string[] || [];
            const removed = existingValue.filter((x) => !formikValue.includes(x));
            const added = formikValue.filter((x) => !existingValue.includes(x));
            obj = {
              [ele]: {
                value: formikValue,
                added,
                removed
              }
            };
          } else if (ele === 'franchise') {
            const eleKey = ele as keyof IFormikValues;
            obj = {
              [ele]: {
                current: existingValues[eleKey],
                new: formik.values[eleKey]
              }
            };
          } else {
            const eleKey = ele as keyof IFormikValues;
            obj = {
              [ele]: formik.values[eleKey]
            };
          }
          request = { ...request, ...obj, id: selectedMovie };
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
          franchise: formik.values.franchise,
          category: formik.values.category
        };
      }
      axiosConfig
        .post(apiURL, request)
        .then(() => {
          resetForm();
        })
        .catch((errors) => {
          console.log(errors);
        });
    }
  });

  const makeSingleOptionItems = (data: any, key: string) => {
    const items: React.JSX.Element[] = [];
    data.forEach((element: any, index: number) => {
      if (element[key]) {
        items.push(
          <ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>
            {element.name}
          </ListSubheader>
        );
        element[key].forEach((el: { _id: string; name: string }) => {
          items.push(
            <MenuItem key={el._id} value={el._id}>
              {el.name}
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

  const makeMultiOptionItems = (data: any, list: string, key: keyof IFormikValues) => {
    const items: React.JSX.Element[] = [];
    data.forEach((element: any, index: number) => {
      if (element[list]) {
        items.push(
          <ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>
            {element.name}
          </ListSubheader>
        );
        element[list].forEach((el: { _id: string; name: string }) => {
          const formikValue = formik.values[key] as string[];
          items.push(
            <MenuItem key={el._id} value={el._id}>
              <Checkbox checked={formikValue.indexOf(el._id) > -1} />
              <ListItemText primary={el.name} />
            </MenuItem>
          );
        });
        items.push(<Divider key={index} />);
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
              const selectedLanguages = [...languageData]
                .filter((language) => selected.includes(language._id))
                .map((element) => element.name);
              return selectedLanguages.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {[...languageData].map((language) => (
              <MenuItem key={language._id} value={language._id}>
                <Checkbox checked={formik.values.language.indexOf(language._id) > -1} />
                <ListItemText primary={language.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.language && formik.errors.language}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="director-multiple-checkbox-label">Director</InputLabel>
          <Select
            labelId="director-multiple-checkbox-label"
            id="director-multiple-checkbox"
            multiple
            name="director"
            value={formik.values.director}
            onChange={formik.handleChange}
            error={formik.touched.director && Boolean(formik.errors.director)}
            input={<OutlinedInput label="Director" />}
            renderValue={(selected: string[]) => {
              const selectedDirectors = [...directorData]
                .filter((director) => selected.includes(director._id))
                .map((element) => element.name);
              return selectedDirectors.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {[...directorData].map((director) => (
              <MenuItem key={director._id} value={director._id}>
                <Checkbox checked={formik.values.director.indexOf(director._id) > -1} />
                <ListItemText primary={director.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.director && formik.errors.director}</FormHelperText>
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
              const selectedGenres = [...genreData]
                .filter((genre) => selected.includes(genre._id))
                .map((element) => element.name);
              return selectedGenres.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {[...genreData].map((genre) => (
              <MenuItem key={genre._id} value={genre._id}>
                <Checkbox checked={formik.values.genre.indexOf(genre._id) > -1} />
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
            {makeSingleOptionItems([...franchiseData], 'franchises')}
          </Select>
          <FormHelperText>{formik.touched.franchise && formik.errors.franchise}</FormHelperText>
        </FormControl>
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="category-label">Award</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            name="category"
            multiple
            value={formik.values.category}
            onChange={formik.handleChange}
            error={formik.touched.category && Boolean(formik.errors.category)}
            input={<OutlinedInput label="Award" />}
            renderValue={(selected: string[]) => {
              const awards = [...categoryData]
                .map((ele) => ele.categories || [])
                .flat()
                .filter((award): award is { _id: string; name: string } => award != null);
              const selectedAwards = awards
                .filter((award) => selected.includes(award._id))
                .map((element) => element.name);
              return selectedAwards.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {makeMultiOptionItems([...categoryData], 'categories', 'category' as keyof IFormikValues)}
          </Select>
          <FormHelperText>{formik.touched.category && formik.errors.category}</FormHelperText>
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
              value={new Date(formik.values.year, 0, 1)}
              openTo="year"
              views={['year']}
              onChange={(newValue) => {
                if (newValue) {
                  formik.setValues({
                    ...formik.values,
                    year: new Date(newValue).getFullYear()
                  });
                }
              }}
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
