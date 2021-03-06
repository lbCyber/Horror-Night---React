import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LoadingModal from './local/loadingModal'
import Swal from 'sweetalert2'
import axios from 'axios'
import MovieCard from './local/movieCard'
import Languages from './local/languages'
import './css/components/movieCard.css';
import './css/components/moviePage.css';
import './css/components/loading.css'
import './css/components/footer.css'
import './css/style.css'
import { CSSTransition } from 'react-transition-group'
import Movie from './local/movie'
import Header from './local/header'
import Footer from './local/footer'

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      apiData: [],
      languages: Languages,
      back: null,
      backFadeOut: false,
      review: {},
      moviePick: null
    }
  }

  warningFire = (warning) => {
    Swal.fire({
      title: 'Oops!',
      text: warning,
      type: 'error',
      confirmButtonText: 'Okay'
    })
  }

  bgCallBack = (bg) => {
    if (window.innerWidth > 768) {
      if (bg === null) {
        this.setState({ backFadeOut: true })
        setTimeout(() => {
          this.setState({
            back: bg,
            backFadeOut: false
          })
        }, 1000)
      } else {
        this.setState({
          back: bg
        })
        setTimeout(() => {
          this.setState({
            backFadeOut: false
          })
        }, 1000)
      }
    }
  }

  simpleBackCB = (e) => {
    this.setState({
      back: e,
      backFadeOut: false
    })
  }

  loadCB = (e) => {
    this.setState({ loading: e })
  }

  moviePickCB = (e) => {
    this.setState({ moviePick: e })
  }

  pickLanguage = function (lang) {
    //Return true/false if language exists in json file
    const langCompare = function (language) {
      return language.iso_639_1 === lang;
    }
    const output = this.state.languages.find(langCompare); //Find the language
    return `${output["english_name"]}` //Return English name
  }

  componentDidMount() {
    axios({
      url: './json/reviews.json',
      method: 'GET',
      dataType: 'json'
    }).then(response => {
      this.setState({ review: response.data })
    }).then(() => {
      axios({
        url: 'https://api.themoviedb.org/3/list/124441',
        method: 'GET',
        dataType: 'json',
        params: { 'api_key': '9c167d58adbd031f02b8a3cbcf7273c1' }
      }).then(response => {
        this.setState({ apiData: response.data.items })
      })
    }).catch(error => {  // If nothing matched, something went wrong on your end!
      this.warningFire(`Something went wrong on our end! Please wait a moment, and try your search again!`)
    }).finally(() => {
      this.setState({
        loading: false
      })
    })
  }

  render() {
    return (
      <Router>
        <CSSTransition
          in={this.state.back !== null && this.state.backFadeOut === false}
          timeout={1000}
          classNames="loadBGFade"
          unmountOnExit>
          <div className="backDrop" style={{ backgroundImage: `radial-gradient(transparent, #000), url("${this.state.back}")` }}></div>
        </CSSTransition>
        <Header moviePageActive={this.state.moviePick === null} callback={this.moviePickCB} backDrop={this.bgCallBack} />
        {(this.state.loading === true) ?
          <CSSTransition
            in={this.state.loading}
            timeout={500}
            classNames="loadFade"
            unmountOnExit>
            <LoadingModal />
          </CSSTransition>
          : <main>
            <div className="wrapper">
              <Switch>
                {
                  this.state.apiData.map((movie, key) => {
                    return (
                      <Route path={`/${movie.id}`} key={key}>
                        <Movie loading={this.loadCB} moviePick={movie} movieReviews={this.state.review[movie.id]} callback={this.moviePickCB} backDrop={this.simpleBackCB} languages={this.state.languages} />
                      </Route>
                    )
                  })
                }
                <Route path="/">
                  <div className="headerBlurb">
                    <h4>For every month for over five years, two best friends have gotten together to find a new horror-themed movie to review, with an eye for overlooked gems or overrated trash.</h4>
                    <h4>Explore the site to discover movies that might interest you! Everything is rated based on five criteria: Enjoyability, Success, Memorability, Recommendability, and Rewatchability. We'll also provide our post-movie discussion on what we thought of the film.</h4>
                    <h4>This is a work in progress (especially the style), so expect major changes and additions soon!</h4>
                    <h4>And of course, Happy Halloween!</h4>
                  </div>
                  <div className="movieGrid">
                    {
                      this.state.apiData.map((movie, key) => {
                        return (
                          <MovieCard moviePick={movie} key={key} language={this.pickLanguage(movie.original_language)} cardNumber={key} ready={this.state.backFadeOut === false && this.state.back === null} reviewData={this.state.review[movie.id]} callback={this.moviePickCB} backDrop={this.bgCallBack} loading={this.loadCB} />
                        )
                      })
                    }
                  </div>
                </Route>
              </Switch>
            </div>
          </main>
        }
        <Footer />
      </Router>
    )
  }
}

export default App;