import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { makeStyles } from '@mui/styles';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Pagination, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GET_MOVIES_URL, GET_TOP_DIRECTOR_URL, GET_TOP_GENRE_URL, GET_TOP_LANGUAGE_URL, GET_TOP_YEAR_URL } from '../helper/config';
import { Box, Button } from '../lib';

const summaryStyles = makeStyles({
  root: {
    minHeight: 80,
    padding: '0px',
    boxSizing: 'border-box'
  },
  content: {
    margin: '0px'
  }
});

interface HomeProps {
  handleMovieUpdateSelection:any;
}

export const Home = (props:HomeProps) => {
  const { handleMovieUpdateSelection } = props;
  const summaryClass = summaryStyles();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [movieData, setMovieData] = useState([]);
  const [topDirectorData, setTopDirectorData] = useState([]);
  const [topLanguageData, setTopLanguageData] = useState([]);
  const [topGenreData, setTopGenreData] = useState([]);
  const [topYearData, setTopYearData] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const limit = 36;
  const history = useHistory();

  const fetchData = () => {
    const moviesUrl = axios.get(`${GET_MOVIES_URL}`, { params: { page, limit } });
    setDataLoading(true);
    axios.all([moviesUrl]).then(axios.spread((...responses) => {
      const { total, page, movies } = responses[0].data;
      setMovieData(movies);
      setTotal(total);
      setPage(page);
      setCount(Math.ceil(total / limit));
      setDataLoading(false);
    })).catch((errors) => {
      setDataLoading(false);
    });
  };

  const fetchTopFilters = () => {
    const topDirectors = axios.get(`${GET_TOP_DIRECTOR_URL}`);
    const topLanguages = axios.get(`${GET_TOP_LANGUAGE_URL}`);
    const topYear = axios.get(`${GET_TOP_YEAR_URL}`);
    const topGenre = axios.get(`${GET_TOP_GENRE_URL}`);
    setFilterLoading(true);
    axios.all([topDirectors, topLanguages, topYear, topGenre]).then(axios.spread((...responses) => {
      setTopDirectorData(responses[0].data.slice(0, 1));
      setTopLanguageData(responses[1].data.slice(0, 1));
      setTopYearData(responses[2].data.slice(0, 1));
      setTopGenreData(responses[3].data.slice(0, 1));
      setFilterLoading(false);
    })).catch((errors) => {
      setFilterLoading(false);
    });
  };
  useEffect(() => {
    fetchData();
    return () => {
    };
  }, [page]);

  useEffect(() => {
    fetchTopFilters();
    return () => {
    };
  }, []);


  const otherMovies = (movies, name, arr) => {
    return arr.length > 1 ? <React.Fragment key={name}><Typography variant="button" display="block">{name}</Typography>
      {
        displayOtherMovies(movies)
      }</React.Fragment> : displayOtherMovies(movies);
  };

  const displayOtherMovies = (movies) => movies.map((otherMovie ) => {
    return otherMovieLinks(otherMovie);
  });

  const otherMovieLinks = (otherMovie) => {
    return (
      <Typography component="div" key={otherMovie._id} >
        <Button href={otherMovie.url} target="_blank" rel="noreferrer" sx={{ padding: '4px 0px' }}>
          {otherMovie.name} ({otherMovie.year})
        </Button>
      </Typography>
    );
  };

  const directorURL = (url, name, id, index, length) => (
    <React.Fragment key={id}>
      <Button href={url} target="_blank" rel="noreferrer" variant="text" sx={{ padding: '4px 0px' }}>
        {name}
      </Button>
      {index !== length-1 ? ' , ' : null}
    </React.Fragment>
  );


  const directorName = (director, index, length) => directorURL(director.url, director.name, director._id, index, length);

  const movieList = movieData?.map((movie) => (
    <Grid item xs = {3} key={movie._id} sx={{ padding: '0px' }}>
      <Accordion sx = {{ padding: '0px', backgroundColor: movie.franchise ?
      movie.franchise.universe ? '#b2dfdb' : '#c8e4fb' : '#ffffed' }} classes={summaryClass}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />
          }

          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{ margin: '0', padding: '0px 8px' }}
        >
          <Typography variant="button" display="block" sx={{ margin: '0px' }}>
            {movie.name} ({movie.year})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div" sx={{ padding: '0px' }}>
            {
              movie.language.map(
                  (element, index, arr)=>
                    <Typography key={element._id} variant="button" display="span" sx={{ padding: '4px 0px' }}>
                      {element.name} {index !== arr.length-1 ? ', ' : null}
                    </Typography>)
            }

            <Typography component="div">
              {
                movie.director.map((element, index, arr) => directorName(element, index, arr.length))
              }
            </Typography>
            {
              movie.genre.map(
                  (element, index, arr)=>
                    <Typography key={element._id} variant="button" display="span" sx={{ padding: '4px 0px' }}>
                      {element.name} {index !== arr.length-1 ? ', ' : null}
                    </Typography>)
            }
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                IMDB:
              {movie.imdb + '/10'}
            </Typography>
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                Rotten Tomatoes:
              {movie.rottenTomatoes ? movie.rottenTomatoes + '%' : 'Not Rated'}
            </Typography>
            { movie.franchise && <React.Fragment>
              <Typography component="div" sx={{ padding: '0px' }}>
                <Typography component="span" sx={{ padding: '4px 0px' }}>
                Franchise:
                </Typography>
                <Typography variant="button" display="span" sx={{ padding: '4px 0px' }}>
                  {movie.franchise.name}
                </Typography>
              </Typography>
              { movie.franchise.universe &&
               <Typography component="div" sx={{ padding: '0px' }}>
                 <Typography component="span" sx={{ padding: '4px 0px' }}>
                Universe:
                   <Typography variant="button" display="span" sx={{ padding: '4px 0px' }}>
                     {movie.franchise.universe.name}
                   </Typography>
                 </Typography>
               </Typography>}
            </React.Fragment>
            }
            {/* <Typography component="div">
              <Button
                variant="text"
                sx={{ padding: '4px 0px' }}
                onClick={() => {
                  handleMovieUpdateSelection(movie._id);
                  history.push('/add-new-movie');
                }}
              >
                Edit Movie Details
              </Button>
            </Typography> */}
            <Typography component="div">
              <Button href={movie.url} target="_blank" rel="noreferrer" sx={{ padding: '4px 0px' }}>
              More Details
              </Button>
            </Typography>
            <Typography component="h6" sx={{ padding: '4px 0px' }}>
                Other Movies from Same Director:
            </Typography>
            {
              movie.director.map((element, index, arr) => {
                const { _id, movies, name } = element;
                const otherMovieList = movies.filter((otherMovie)=> otherMovie._id !== movie._id);
                return otherMovies( otherMovieList, name, arr);
              })
            }
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  ));

  const topDirectorsList = topDirectorData.map((director) => (
    <Typography variant="button" display="span" key={director._id}>{director.name} ({director.length}) </Typography>
  ));
  const topYearsList = topYearData.map((year) => (
    <Typography variant="button" display="span" key={year._id}>{year._id} ({year.count}) </Typography>
  ));

  const topLanguagesList = topLanguageData.map((language) => (
    <Typography variant="button" display="span"key={language._id}>{language.name} ({language.length}) </Typography>
  ));

  const topGenresList = topGenreData.map((genre) => (
    <Typography variant="button" display="span"key={genre._id}>{genre.name} ({genre.length}) </Typography>
  ));

  const handleChange = (event, value) => {
    setPage(value);
  };

  return (<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    alignItems: 'center', height: 'calc(100vh - 56px)', boxSizing: 'border-box' }}>
    { filterLoading && dataLoading ? <CircularProgress/> : <React.Fragment>
      <Box sx={{ display: 'flex', margin: '0px', boxSizing: 'border-box',
        alignContent: 'flex-start', justifyContent: 'space-evenly', alignItems: 'center', width: '100%' }}>
        <Typography component="h6">Total: {total}</Typography>
        <Typography component="h6">Director: {topDirectorsList}</Typography>
        <Typography component="h6">Language: {topLanguagesList}</Typography>
        <Typography component="h6">Year: {topYearsList}</Typography>
        <Typography component="h6">Genre: {topGenresList}</Typography>
      </Box>
      <Grid container
        spacing = {2} sx={{ margin: '0px', padding: '0px', boxSizing: 'border-box' }}>
        {movieList}
      </Grid>
      <Box sx={{ margin: '0px ', boxSizing: 'border-box',
        display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'
      }}>
        <Pagination count={count} color="primary" onChange={handleChange} page={page} showFirstButton showLastButton />
      </Box>
    </React.Fragment> }

  </Box>);
};
