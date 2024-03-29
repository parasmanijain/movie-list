import { useState, useEffect } from 'react';
import axiosConfig from '../../helper/axiosConfig';
import { useFormik } from 'formik';
import { ADD_NEW_DIRECTOR_URL, GET_COUNTRIES_URL, MenuProps } from '../../helper/config';
import { directorValidationSchema as validationSchema } from '../../helper/validationScehmas';
import {
  Box,
  Button,
  TextField,
  Select,
  CheckBox,
  InputLabel,
  ListItemText,
  MenuItem,
  FormControl,
  OutlinedInput,
  FormHelperText
} from '../lib';

export const AddNewDirector = () => {
  const [countryData, setCountryData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      country: []
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      axiosConfig
        .post(`${ADD_NEW_DIRECTOR_URL}`, {
          name: formik.values.name,
          url: formik.values.url,
          country: formik.values.country
        })
        .then(() => {
          resetForm();
        })
        .catch((errors) => {
          console.log(errors);
        });
    }
  });
  useEffect(() => {
    axiosConfig
      .get(`${GET_COUNTRIES_URL}`, {})
      .then((response) => {
        setCountryData(response.data);
      })
      .catch((errors) => {
        console.log(errors);
      });
    return () => {
      setCountryData([]);
    };
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl sx={{ m: 2, width: 300 }}>
          <TextField
            id="name"
            name="name"
            label="Director"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
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
        <FormControl sx={{ m: 2, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Country</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            name="country"
            value={formik.values.country}
            onChange={formik.handleChange}
            error={formik.touched.country && Boolean(formik.errors.country)}
            input={<OutlinedInput label="Country" />}
            renderValue={(selected: string[]) => {
              const selectedCountries = countryData
                .filter((country) => selected.includes(country._id))
                .map((element) => element.name);
              return selectedCountries.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {countryData.map((country) => (
              <MenuItem key={country._id} value={country._id}>
                <CheckBox checked={formik.values.country.indexOf(country._id) > -1} />
                <ListItemText primary={country.name} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formik.touched.country && formik.errors.country}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </form>
  );
};
