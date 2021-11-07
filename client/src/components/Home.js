import React, {useState, useEffect} from 'react';
import { Link, Route, useParams, useRouteMatch } from "react-router-dom";

import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Link as MaterialLink , Accordion, AccordionSummary,AccordionDetails, Button } from "@material-ui/core";
import Pagination from '@material-ui/lab/Pagination';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
    root: {
      width:'100%'
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });

  const summaryStyles = makeStyles({
    root: {
      minHeight:60,
      padding:'0 5px'
    },
    content: {
        margin:0
    }
  });
export const Home = () => {
    const classes = useStyles();
    const summaryClass = summaryStyles();
    const [page, setPage]= useState(1);
    const [count,setCount] = useState(1);
    const [total,setTotal] = useState(0);
    const limit = 32;
   
    const fetchData = () => {
        const moviesUrl = axios.get('http://localhost:8000/movies',{ params: { page, limit } });
        axios.all([moviesUrl]).then(axios.spread((...responses) => {
            const { total, page, movies } = responses[0].data;
            setMovieData(movies);
            setTotal(total);
            setPage(page);
            setCount(Math.ceil(total/limit));
        })).catch(errors => {
            // react on errors.
        })
    }

    const fetchTopFilters = () => {
        const topDirectors = axios.get('http://localhost:8000/topDirector');
        const topLanguages = axios.get('http://localhost:8000/topLanguage');
        const topYear = axios.get('http://localhost:8000/topYear');
        axios.all([topDirectors,topLanguages,topYear]).then(axios.spread((...responses) => {
            setTopDirectorData(responses[0].data.slice(0,1));
            setTopLanguageData(responses[1].data.slice(0,1));
            setTopYearData(responses[2].data.slice(0,1));
        })).catch(errors => {
            // react on errors.
          })
    }
    useEffect(() => {
        fetchData();
          return () => {
        }
    }, [page]);

    useEffect(() => {
        fetchTopFilters();
          return () => {
        }
    }, []);
    const { url, path } = useRouteMatch();
    const [movieData,setMovieData] = useState([]);
    const [topDirectorData,setTopDirectorData] = useState([]);
    const [topLanguageData,setTopLanguageData] = useState([]);
    const [topYearData,setTopYearData] = useState([]);
    const movieList = movieData?.map(movie => {
            return (
          <Grid item xs={6} lg={3} xl={2} key={movie._id}>
                <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />
           }
           classes = {summaryClass}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography component="div" className={classes.heading}>
              {movie.name} ({movie.year})
              </Typography>
        </AccordionSummary>
        <AccordionDetails>
        <Typography component="div">
                  {movie.language.name}
                  <Typography component="div">
                    <MaterialLink  href={movie.director.url} target="_blank"  rel="noreferrer">
                    {movie.director.name}
                    </MaterialLink>
                  </Typography>
                  <Typography component="div">
                    IMDB:
                    {movie.imdb}
                  </Typography>
                  <Typography component="div">
                    Rotten Tomatoes:
                    {movie.rottenTomatoes}%
                  </Typography>
                  <Typography component="div">
                    <Link to={`/edit-movie-details/${movie._id}`}>Edit Movie Details</Link>
                  </Typography>
                  <MaterialLink href={movie.url} target="_blank"  rel="noreferrer">
                    More Details
                 </MaterialLink>
                 <Typography component="div">
                    Other Movies from Same Director:
                </Typography>
                {
                    movie.director.movies.map(otherMovie => {
                        if(otherMovie._id !== movie._id) {
                            return(
                                <Typography key={otherMovie._id} component="div">
                                <MaterialLink  href={otherMovie.url} target="_blank"  rel="noreferrer">
                                {otherMovie.name} ({otherMovie.year})
                             </MaterialLink>
                             </Typography>                            
                                )
                            }
                        }
                    )
                }
                  </Typography>
        </AccordionDetails>
      </Accordion>
          </Grid>
        )});

    const topDirectorsList = topDirectorData.map(director => {
        return(
            <span key={director._id}>{director.name} ({director.length}) </span>
        )
    });
    const topYearsList = topYearData.map(year => {
        return(
            <span key={year._id}>{year._id} ({year.count}) </span>
        )
    });
    const topLanguagesList = topLanguageData.map(language => {
        return(
            <span key={language._id}>{language.name} ({language.length}) </span>
        )
    });
    const handleChange = (event, value) => {
        setPage(value);
      };

    return (
            <div className={classes.root}>
            <div className="top-panel">
                <div><label htmlFor="movies">Total Movies watched so far: {total} </label></div>
                <div><label htmlFor="directors">Most watched Director:</label> {topDirectorsList}</div>
                <div><label htmlFor="languages">Most watched Language:</label> {topLanguagesList}</div>
                <div><label htmlFor="year">Most watched Year:</label> {topYearsList}</div>
            </div>
            <div style={{ margin: 5, padding: 5 }}>
      <Grid container spacing={2} justify="flex-start">
            {movieList}
           
      </Grid>
    </div>
        <div className="pagination-panel">
        <Pagination count={count} color="primary" onChange={handleChange} page={page} showFirstButton showLastButton/>
        </div>
            </div>
    )
}
