import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(2),
        width: '50ch',
      },
    },
  }));

  const validationSchema = yup.object({
    name: yup
      .string('Enter the country')
      .required('Country is required')
  });

export const AddNewCountry = () => {
    const classes = useStyles();
    const formik = useFormik({
    initialValues: {
        name: ''
    },
    validationSchema: validationSchema,
    onSubmit: () => {
        axios.post('http://localhost:8000/country', {
            name:formik.values.name
        })
        .then(function (response) {
        console.log(response);
        })
        .catch(function (response) {
        console.log(response);
        })
    },
});
    return (
        <div className={classes.root}>
        <form onSubmit={formik.handleSubmit}>
        <TextField
        variant="outlined"
          id="name"
          name="name"
          label="Country"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
        </div>
    )
}
