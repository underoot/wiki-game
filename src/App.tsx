import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useSearchParams} from 'react-router-dom';
import {Container, TextField, Button, Box, CircularProgress, Grid} from '@mui/material';

type PageResult = {
  pageName: string;
  pageLink: string;
  imageUrl: string | null;
}

const getPageResults = async (page: string) => {
  const res = await fetch('https://powerful-retreat-09084.herokuapp.com/api/v1/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      page
    })
  });

  return await res.json();
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shareId] = React.useState(() => searchParams.get('shareId'));
  const [pageName, setPageName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<PageResult[]>([]);

  const onTryAgain = React.useCallback(() => {
    setResults([]);
  }, []);

  const onChangeValue = React.useCallback((e: any) => {
    setPageName(e.target.value);
  }, []);

  const onSubmit = React.useCallback(async (e: any) => {
    e.preventDefault();
    if (!pageName.trim()) {
      return;
    }

    setPageName('');
    setIsLoading(true);

    try {
      const r = await getPageResults(pageName);
      setResults(r.pages);
    } catch {
      // Doing something
    } finally {
      setIsLoading(false);
    }
  }, [pageName]);

  return (
    <Container maxWidth='sm'>
      <p>
        Wikipedia is a wonderfull place: a black hole to <a href="https://en.wikipedia.org/wiki/Alice%27s_Adventures_in_Wonderland" target="_blank">Wonderland</a>
      </p>
      <p>
        There is <a href="https://www.newyorker.com/magazine/2022/04/25/wikipedia-in-the-flesh" target="_blank">comedy show about Wikipedia</a>, fan groups and enthusiasts. But one of the interesting thing about Wikipedia that you can go to any pages of Wikipedia and by, at most, 5 clicks go to <a href="https://en.wikipedia.org/wiki/Adolf_Hitler" target="_blank">Adolf Hitler</a> page. Try it here. Put in the box below any word from <a href="https://en.wikipedia.org/">English Wikipedia</a> and let's see...
      </p>
      {!isLoading && results.length === 0 && (
        <Box paddingY={4} display="flex" justifyContent="center">
          <form onSubmit={onSubmit}>
            <Box paddingBottom={2}>
              <TextField label="Wikipedia page" variant="outlined" value={pageName} onChange={onChangeValue} fullWidth />
            </Box>
            <Button type="submit" variant="contained">Submit</Button>
          </form>
        </Box>
      )}
      {isLoading && results.length === 0 && (
        <Box paddingY={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
      {results.length > 0 && (
        <>
          <Box paddingY={4} display="flex" justifyContent="center">
            <Button onClick={onTryAgain} variant="contained">Try again</Button>
          </Box>
          <Grid container className="results" spacing={2}>
            {results.map((r, idx) => (
              <Grid item xs={12} key={r.pageName}>
                <a href={r.pageLink} target='_blank'>
                  <Box className='results__image'>
                    {r.imageUrl && <div style={{backgroundImage: `url(${r.imageUrl}`}}></div>}
                  </Box>
                  {r.pageName}
                </a>
                {idx !== results.length - 1 && <div>▼</div>}
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default App;
