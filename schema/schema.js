const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');


const axiosGetWrapper = endpoint => axios.get(`http://localhost:3000/${endpoint}`).then(({data}) => data);


const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: ({ id }) => axiosGetWrapper(`companies/${id}/users`)
    }
  })
});


const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    firstName: {
      type: GraphQLString
    },
    age: {
      type: GraphQLInt
    },
    company: {
      type: CompanyType,
      resolve: ({ companyId }) => axiosGetWrapper(`/companies/${companyId}`)
    }
  })
});


// allow to land of specific node in graph which represent data
const RooQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      //use to find user with specific id passed as a argument
      //use to grab real data
      resolve: (parentValue, { id }) => axiosGetWrapper(`/users/${id}`)
    },
    company:{
      type: CompanyType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      //use to find user with specific id passed as a argument
      //use to grab real data
      resolve: (parentValue, { id }) => axiosGetWrapper(`/companies/${id}`)
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
     addUser: {
       type: UserType,
       args: {
         firstName: {
           type: new GraphQLNonNull(GraphQLString)
         },
         age: {
           type: new GraphQLNonNull(GraphQLInt)
         },
         companyId: {
           type: GraphQLString
         }
       },
       resolve: (parentValue, body) => axios.post('http://localhost:3000/users', body).then(({data}) => data)
  
     },
    deleteUser: {
        type: UserType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: (parentValue, { id }) => axios.delete(`http://localhost:3000/users/${id}`).then(({data}) => data)
    },
    editUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        },
        firstName: {
          type: GraphQLString
        },
        age: {
          type: GraphQLInt
        },
        companyId: {
          type: GraphQLString
        }
      },
      resolve: (parentValue, {id, ...restBody}) => axios.patch(`http://localhost:3000/users/${id}`, {
        id,
        ...restBody
      }).then(({data}) => data)
    }
  }
});

module.exports = new GraphQLSchema({
  query: RooQuery,
  mutation
});