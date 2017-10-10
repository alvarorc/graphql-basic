const axios = require('axios');
const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    catchPhrase: { type: GraphQLString },
    bs: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:4000/companies/${parentValue.id}/users`)
          .then(({data}) => data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    website: { type: GraphQLString },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:4000/companies/${parentValue.companyId}`)
          .then(({data}) => data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLInt } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:4000/users/${args.id}`)
          .then(({data}) => data);
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLInt } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:4000/companies/${args.id}`)
          .then(({data}) => data);
      }
    }
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        website: { type: GraphQLString },
        companyId: { type: GraphQLInt }
      },
      resolve(parentValue, { name, username, email, phone, website, companyId }) {
        phone = phone || "+00 0 000-000-0000";
        website = website || "no site";
        return axios.post('http://localhost:4000/users', { name, username, email, phone, website, companyId})
          .then(({data}) => data);
      }
    },
    deleteUser: {
      type: GraphQLInt,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:4000/users/${id}`)
          .then(response => response.code);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        website: { type: GraphQLString },
        companyId: { type: GraphQLInt }
      },
      resolve(parentValue, { id, name, username, email, phone, website, companyId }) {
        return axios.patch(`http://localhost:4000/users/${id}`, { name, username, email, phone, website, companyId })
          .then(response => response.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});
