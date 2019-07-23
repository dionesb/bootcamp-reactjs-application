import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  FilterSelect,
  Pagination,
  PaginationButton,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    /* As promisses contidas no array seram todas executadas ao mesmo tempo. */
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async e => {
    e.preventDefault();

    const { repository } = this.state;

    const filter = document.getElementById('filterSelect').value;
    /* As promisses contidas no array seram todas executadas ao mesmo tempo. */
    const [issues] = await Promise.all([
      api.get(`/repos/${repository.full_name}/issues`, {
        params: {
          state: filter,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      issues: issues.data,
    });
  };

  previousPage = async e => {
    e.preventDefault();
    console.log('Página anterior');

    const { repository, page } = this.state;

    if (page > 1) {
      const newPage = page - 1;

      const filter = document.getElementById('filterSelect').value;
      /* As promisses contidas no array seram todas executadas ao mesmo tempo. */
      const [issues] = await Promise.all([
        api.get(`/repos/${repository.full_name}/issues`, {
          params: {
            state: filter,
            per_page: 5,
            page: newPage,
          },
        }),
      ]);

      this.setState({
        issues: issues.data,
        page: newPage,
      });
    }
  };

  nextPage = async e => {
    e.preventDefault();
    console.log('Página seguinte');

    const { repository, page } = this.state;

    if (page < 30) {
      const newPage = page + 1;

      const filter = document.getElementById('filterSelect').value;
      /* As promisses contidas no array seram todas executadas ao mesmo tempo. */
      const [issues] = await Promise.all([
        api.get(`/repos/${repository.full_name}/issues`, {
          params: {
            state: filter,
            per_page: 5,
            page: newPage,
          },
        }),
      ]);

      if (issues.data.length > 0) {
        this.setState({
          issues: issues.data,
          page: newPage,
        });
      }
    }
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <FilterSelect id="filterSelect" onChange={this.handleFilter}>
          <option value="all">Todos</option>
          <option value="open">Abertos</option>
          <option value="closed">Fechados</option>
        </FilterSelect>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <PaginationButton prevPage={page} onClick={this.previousPage}>
            Anterior
          </PaginationButton>
          <strong>{page}</strong>
          <PaginationButton onClick={this.nextPage}>Próxima</PaginationButton>
        </Pagination>
      </Container>
    );
  }
}
