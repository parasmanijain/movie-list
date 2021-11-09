import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { makeStyles } from '@mui/styles';
import { Button, TextField, InputLabel, Select, FormControl, FormHelperText } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
    },
  },
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
  },
}));

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  url: yup
    .string()
    .matches(URL_REGEX)
    .required('URL is required'),
  country: yup
    .string()
    .required('Country is required')
});

export const AddNewDirector = () => {
  const classes = useStyles();
  const [countryData, setCountryData] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8000/countries', {
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
  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      country: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      axios.post('http://localhost:8000/director', {
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
  return (
    <div className={classes.root}>
      <form onSubmit={formik.handleSubmit} id="form" autoComplete="off">
        <TextField
          variant="outlined"
          id="name"
          name="name"
          label="Director"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          variant="outlined"
          id="url"
          name="url"
          label="URL"
          value={formik.values.url}
          onChange={formik.handleChange}
          error={formik.touched.url && Boolean(formik.errors.url)}
          helperText={formik.touched.url && formik.errors.url}
        />
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel htmlFor="country">Country</InputLabel>
          <Select
            native
            variant="outlined"
            id="country"
            name="country"
            value={formik.values.country}
            onChange={formik.handleChange}
            error={formik.touched.country && Boolean(formik.errors.country)}
            label="Country"
            inputProps={{
              name: 'country',
              id: 'outlined-age-native-simple',
            }}
          >
            <option aria-label="None" value="" />
            {

              countryData.map((e) => {
                return <option key={e._id} value={e._id}>{e.name}</option>;
              })}
          </Select>
          <FormHelperText>{formik.touched.country && formik.errors.country}</FormHelperText>
        </FormControl>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>)
}