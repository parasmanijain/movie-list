import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {Button, TextField, OutlinedInput, InputLabel, FormHelperText, MenuItem, FormControl, ListItemText, Checkbox, Select} from '@mui/material';

import { API_URL } from '../config';

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const validationSchema = yup.object({
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


export const  AddNewDirector = () => {
  const [countryData, setCountryData] = useState([]);
  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      country: []
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      axios.post(`${API_URL}/director`, {
        name: formik.values.name,
        url: formik.values.url,
        country: formik.values.country
      })
        .then(function (response) {
        })
        .catch(function (response) {
          console.log(response);
        })
    }
  });
  useEffect(() => {
    axios.get(`${API_URL}/countries`, {
    })
      .then(function (response) {
        setCountryData(response.data);
      })
      .catch(function (response) {
        console.log(response);
      })
    return () => {
      setCountryData([]);
    }
  }, []);

  
  return (
    <div>
            <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
            <TextField
          id="name"
          name="name"
          label="Director"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          id="url"
          name="url"
          label="URL"
          value={formik.values.url}
          onChange={formik.handleChange}
          error={formik.touched.url && Boolean(formik.errors.url)}
          helperText={formik.touched.url && formik.errors.url}
        />
      <FormControl sx={{ m: 1, width: 300 }}>
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
          renderValue={(selected:string[]) => {
            const selectedCountries = (countryData.filter((country)=> selected.includes(country._id))).map((element)=> element.name);
            return selectedCountries.join(', ')}
          }
          MenuProps={MenuProps}
        >
              
          {countryData.map((country) => (
            <MenuItem key={country._id} value={country._id}>
              <Checkbox checked={formik.values.country.indexOf(country._id) > -1} />
              <ListItemText primary={country.name} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{formik.touched.country && formik.errors.country}</FormHelperText>
      </FormControl>
      <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
}
