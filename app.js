const express = require("express");

const app = express();

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

app.use(express.json());

const intilizerDbandServerstart = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server is started");
    });
  } catch (e) {
    console.log(`The DB Error ${e.message}`);
    process.exit(1);
  }
};

intilizerDbandServerstart();

// API 1 return the all the movies names
app.get("/movies/", async (request, response) => {
  const movie_list = `
       SELECT 
         movie_name AS movieName
        FROM 
        movie;
    `;
  const movies_list = await db.all(movie_list);
  response.send(movies_list);
});

//API 2 add the new movie in the database

app.post("/movies/", async (request, response) => {
  const add_movie = request.body;
  const { directorId, movieName, leadActor } = add_movie;
  const new_movie = `
    INSERT INTO movie(
        director_id,
        movie_name,
        lead_actor
    )
    VALUES
    (${directorId},'${movieName}','${leadActor}');
  `;
  const add_new_movie = await db.run(new_movie);
  response.send("Movie Successfully Added");
});

//API 3 return the movie based on the movie_id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const one_movie = `
     SELECT 
      movie_id AS movieId,
      director_id AS directorId,
      movie_name AS movieName,
      lead_actor AS leadActor
      FROM
      movie 
      WHERE movie_id = ${movieId};    
    `;
  const one_movie_data = await db.get(one_movie);
  response.send(one_movie_data);
});

//API 4 to update the one movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const { directorId, movieName, leadActor } = request.body;
  const update_data = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}';
    WHERE movie_id = ${movieId};
  `;
  await db.run(update_data);
  response.send("Movie Details Updated");
});

//API 5 to delete one movie based on the movie_id

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deltemovie = `
  DELETE 
   FROM 
   movie 
   WHERE movie_id =${movieId};
 `;
  await db.run(deltemovie);
  response.send("Movie Removed");
});

//API 6 TO ACCESS THE director list

app.get("/directors/", async (request, response) => {
  const director_list = `
     SELECT 
      director_id AS directorId,
      director_name AS directorName
    FROM 
     director ;
    `;
  const directors = await db.all(director_list);
  response.send(directors);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const director_movielist = `
      SELECT 
        movie.movie_name AS movieName
       FROM 
       director INNER JOIN movie ON director.director_id = movie.director_id
       WHERE director.director_id = ${directorId};
     `;
  const director_movies = await db.all(director_movielist);
  response.send(director_movies);
});

module.exports = app;
