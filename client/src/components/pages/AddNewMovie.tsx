import { useState, useEffect } from 'react';
import { Schema } from 'mongoose';
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
  MenuProps,
  UPDATE_EXISTING_MOVIE_URL
} from '../../helper/config';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { movieValidationSchema as validationSchema } from '../../helper/validationScehmas';
import {
  Box,
  Button,
  TextField,
  Select,
  CheckBox,
  FormControl,
  InputLabel,
  MenuItem,
  ListItemText,
  Divider,
  OutlinedInput,
  ListSubheader,
  FormHelperText
} from '../lib';
import { Language } from '../../models/Language';

interface IFormikValues {
  name: string;
  language: Schema.Types.ObjectId[];
  director: Schema.Types.ObjectId[];
  imdb: string;
  rottenTomatoes?: string;
  year: number;
  url: string;
  genre: Schema.Types.ObjectId[];
  franchise?: Schema.Types.ObjectId | string;
  category?: Schema.Types.ObjectId[];
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

export const AddNewMovie = (props: { selectedMovie?: string }) => {
  const { selectedMovie } = props;
  const [languageData, setLanguageData] = useState<Language[]>([]);
  const [genreData, setGenreData] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [directorData, setDirectorData] = useState([]);
  const [existingValues, setExistingValues] = useState({});
  const [, setSelectedMovieData] = useState(null);

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

  const fetchSelectedMovieDetails = (franchiseList) => {
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
          const languageValues: Schema.Types.ObjectId[] = language.map(
            (element: { _id: Schema.Types.ObjectId }) => element._id
          );
          const directorValues: Schema.Types.ObjectId[] = director.map(
            (element: { _id: Schema.Types.ObjectId }) => element._id
          );
          const genreValues: Schema.Types.ObjectId[] = genre.map(
            (element: { _id: Schema.Types.ObjectId }) => element._id
          );
          let categoryValues: Schema.Types.ObjectId[];
          if (category) {
            categoryValues = category.map((element: { _id: Schema.Types.ObjectId }) => element._id);
          }
          let franchiseValue: { _id: Schema.Types.ObjectId }[];
          if (franchise && franchise.universe) {
            franchiseValue = franchiseList
              .find((ele: { _id: Schema.Types.ObjectId }) => ele._id === franchise.universe)
              .franchises.filter((x: { _id: Schema.Types.ObjectId }) => x._id === franchise._id);
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
            franchise: franchise ? franchiseValue[0]._id : '',
            category: categoryValues ? categoryValues : null
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
          (result, value, key: string | number) =>
            _.isEqual(value, formik.values[key]) ? result : result.concat(key.toString()),
          []
        );
        const arrkeys = ['language', 'director', 'genre', 'category'];
        diff.forEach((ele: string) => {
          let obj = {};
          if (arrkeys.includes(ele)) {
            const removed = existingValues[ele].filter((x) => !formik.values[ele].includes(x));
            const added = formik.values[ele].filter((x) => !existingValues[ele].includes(x));
            obj = {
              [ele]: {
                value: formik.values[ele],
                added,
                removed
              }
            };
          } else if (ele === 'franchise') {
            obj = {
              [ele]: {
                current: existingValues[ele],
                new: formik.values[ele]
              }
            };
          } else {
            obj = {
              [ele]: formik.values[ele]
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

  const makeSingleOptionItems = (data, key: string) => {
    const items = [];
    data.forEach((element, index: number) => {
      if (element[key]) {
        items.push(
          <ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>
            {element.name}
          </ListSubheader>
        );
        element[key].forEach((el: { _id: Schema.Types.ObjectId; name: string }) => {
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

  const makeMultiOptionItems = (data, list: string, key: string) => {
    const items = [];
    data.forEach((element, index: number) => {
      if (element[list]) {
        items.push(
          <ListSubheader sx={{ fontSize: '16px', fontWeight: '700' }} key={element._id + index}>
            {element.name}
          </ListSubheader>
        );
        element[list].forEach((el: { _id: Schema.Types.ObjectId; name: string }) => {
          items.push(
            <MenuItem key={el._id} value={el._id}>
              <CheckBox checked={formik.values[key].indexOf(el._id) > -1} />
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
            renderValue={(selected: Schema.Types.ObjectId[]) => {
              const selectedLanguages = [...languageData]
                .filter((language) => selected.includes(language._id))
                .map((element) => element.name);
              return selectedLanguages.join(', ');
            }}
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
                const selectedDirectors = [...directorData]
                  .filter((director) => selected.includes(director._id))
                  .map((element) => element.name);
                return selectedDirectors.join(', ');
              }
            }}
            error={formik.touched.director && Boolean(formik.errors.director)}
            helperText={formik.touched.director && formik.errors.director}
          >
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
              const selectedGenres = [...genreData]
                .filter((genre) => selected.includes(genre._id))
                .map((element) => element.name);
              return selectedGenres.join(', ');
            }}
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
              const awards = [...categoryData].map((ele) => ele.categories).flat();
              const selectedAwards = awards
                .filter((award) => selected.includes(award._id))
                .map((element) => element.name);
              return selectedAwards.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {makeMultiOptionItems([...categoryData], 'categories', 'category')}
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
              value={new Date().setUTCFullYear(formik.values.year)}
              view={'year'}
              views={['year']}
              onChange={(newValue) => {
                formik.setValues({
                  ...formik.values,
                  year: new Date(newValue).getFullYear()
                });
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
