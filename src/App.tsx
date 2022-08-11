import React from 'react';
import './App.css';
import {Container, TextField, Button, Box, CircularProgress, Grid} from '@mui/material';

type PageResult = {
  pageName: string;
  pageLink: string;
  imageUrl: string | null;
}

function fallbackCopyTextToClipboard(text: string) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

const getPageResults = async (page: string) => {
  const res = await fetch('https://game.wiki.underoot.dev/api/v1/get', {
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
  const [pageName, setPageName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [results, setResults] = React.useState<PageResult[]>([]);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const onTryAgain = React.useCallback(() => {
    setResults([]);
    setError(undefined);
  }, []);

  const onCopyResults = React.useCallback(() => {
    if (!resultsRef.current) {
      return;
    }

    let text = results.map(r => `${r.pageName} - ${r.pageLink}`).join('\n');

    text += `\n${results.length} to Hitler. Check on https://underoot.dev/wiki-game`;

    copyTextToClipboard(text);
  }, [results]);

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
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [pageName]);

  return (
    <Container maxWidth='sm'>
      <p>
        Wikipedia is a wonderful place: a black hole to <a href="https://en.wikipedia.org/wiki/Alice%27s_Adventures_in_Wonderland" target="_blank" rel="noreferrer">Wonderland</a>
      </p>
      <p>
        There is <a href="https://www.newyorker.com/magazine/2022/04/25/wikipedia-in-the-flesh" target="_blank" rel="noreferrer">a comedy show about Wikipedia</a>, fan groups and enthusiasts. But one of the interesting things about Wikipedia is that you can go to any page of Wikipedia and, at most, by 5 clicks go to <a href="https://en.wikipedia.org/wiki/Adolf_Hitler" target="_blank" rel="noreferrer">Adolf Hitler</a> page. Try it here. Put in the box below any word from <a href="https://en.wikipedia.org/">English Wikipedia</a> and let's see...
      </p>
      {!isLoading && !error && results.length === 0 && (
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
      {error && (
        <Box paddingY={4} display="flex" justifyContent="center" flexDirection="column">
          <Button onClick={onTryAgain} variant="contained">Try again</Button>
          <p>
            Something bad happened. Please, try again
          </p>
          <pre>
            {error.message}
          </pre>
        </Box>
      )}
      {results.length > 0 && (
        <div ref={resultsRef}>
          <Box paddingBottom={8}>
            <Box paddingY={4} display="flex" justifyContent="center">
              <Box paddingRight={2}>
                <Button onClick={onTryAgain} variant="contained">Try again</Button>
              </Box>
              <Button onClick={onCopyResults} variant="contained" color="secondary">Copy</Button>
            </Box>
            <Grid container className="results" spacing={2}>
              {results.map((r, idx) => (
                <Grid item xs={12} key={r.pageName}>
                  <a href={r.pageLink} target='_blank' rel="noreferrer">
                    <Box className='results__image'>
                      {r.imageUrl && <div style={{backgroundImage: `url(${r.imageUrl}`}}></div>}
                    </Box>
                    {r.pageName}
                  </a>
                  {idx !== results.length - 1 && <div>▼</div>}
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      )}
    </Container>
  );
}

export default App;
