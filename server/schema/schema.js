const { projects, clients} = require('../sampleData');


const Project = require("../models/Project");
const Client = require("../models/Client");

const { graphql, buildSchema, GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require("graphql");

// Client Type
const ClientType= new GraphQLObjectType({
    name:'Client',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString},
   
    })
});
// Project Type
const ProjectType= new GraphQLObjectType({
    name:'Project',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
        description:{type:GraphQLString},
        status:{type:GraphQLString},
        clientId:{type:GraphQLID},
        client:{
            type: ClientType,
            resolve(parent,args){
                // return clients.find(client => client.id === parent.clientId)
                return Client.findById(parent.clientId);
            }
            
        }

    })
});
// Project with only clientId Type
const ProjectClientType= new GraphQLObjectType({
    name:'Projects',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
        description:{type:GraphQLString},
        status:{type:GraphQLString},
        clientId:{type:GraphQLID},
     

    })
});
// Client Projects Type
const ClientProjectsType= new GraphQLObjectType({
    name:'Clients',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString},
        projects:{
            type:new GraphQLList(ProjectType),
            resolve(parent,args){
                return Project.find({clientId:parent.id})
                
            }
        
        },
        // projects:{type:GraphQLString}

    })
});
// Client Projects Type
const ClientProjectsDeleteType= new GraphQLObjectType({
    name:'ClientsDelete',
    fields:()=>({
        id: {type:GraphQLID},
        name:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString},
        projects:{
            type:new GraphQLList(ProjectType),
            resolve(parent,args){
                // return Project.find({clientId:parent.id}).findOneAndRemove()
                const test= Project.find({clientId:parent.id})
                for(const element of test ){
                   return element.findOneAndRemove({element})
                }
            }
        
        },
        // projects:{type:GraphQLString}

    })
});
const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields: {
        clients:{
            type: new GraphQLList(ClientType),
            resolve(parent,args){
                // return clients
                return Client.find();
            }
        },
        client:{
            type: ClientType,
            args:{id: {type:GraphQLID}},
            resolve(parent, args){
                // return clients.find(client => client.id === args.id);
                return Client.findById(args.id)
                
            }   
        },
        projects:{
            type: new GraphQLList(ProjectType),
            resolve(parent,args){
               return Project.find();
            }
        },
        project:{
            type: ProjectType,
            args:{id: {type:GraphQLID}},
            resolve(parent, args){
                return Project.findById(args.id)
            }   
        },
        clientprojects:{
            type: ClientProjectsType,
            args:{id: {type:GraphQLID}},
            resolve(parent,args){
             
                return Client.findById(args.id)
            }
        },
    },
    
});



// Mutations
const mutation = new GraphQLObjectType({
    name:'Mutations',
    fields:{
        // Add client
        addClient:{
            type:ClientType,
            args:{
                name: {type:GraphQLNonNull(GraphQLString)},
                email: {type:GraphQLNonNull(GraphQLString)},
                phone: {type:GraphQLNonNull(GraphQLString)},
            },
            resolve(parent,args){
                const client= new Client({
                    name:args.name,
                    email:args.email,
                    phone:args.phone,
                });
                return client.save();
            }
        },
        // Delete Client
        deleteClient: {
            type: ClientType,
            args: {
              id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
              Project.find({ clientId: args.id }).then((projects) => {
                projects.forEach((project) => {
                  project.deleteOne();
                });
              });
      
              return Client.findByIdAndRemove(args.id);
            },
          },
    
        // Add Project
        addProject:{
            type: ProjectType,
            args:{
                name: {type:GraphQLNonNull(GraphQLString)},
                description: {type:GraphQLNonNull(GraphQLString)},
               
                status:{
                    type: new GraphQLEnumType({
                        name:'ProjectStatus',
                        values:{
                            "new": {value: 'Not Started'},
                            "progress": {value: 'In Progress'},
                            "completed": {value: 'Completed'},
                        }
                    }),
                    defaultValue:'Not Started',
                },
                clientId: {type:GraphQLNonNull(GraphQLID)},
            },
            resolve(parent,args){
                const project= new Project({
                    name:args.name,
                    description:args.description,
                    status:args.status,
                    clientId:args.clientId,
                });
                return project.save();
            }
        },
        //  Delete project
        deleteProject:{
            type: ProjectType,
            args:{
                id: {type:GraphQLNonNull(GraphQLID)},
            },
            resolve(parent,args){
                return Project.findByIdAndRemove(args.id)
            },

        },
        // Update project
        updateProject:{
            type: ProjectType,
            args:{
                id: {type:GraphQLNonNull(GraphQLID)},
                name: {type:GraphQLString},
                description: {type:GraphQLString},
                status:{
                    type: new GraphQLEnumType({
                        name:'ProjectStatusUpdate',
                        values:{
                            "new": {value: 'Not Started'},
                            "progress": {value: 'In Progress'},
                            "completed": {value: 'Completed'},
                        }
                    }),
                 
                },
            },
            resolve(parent,args){
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name:args.name,
                            description:args.description,
                            status:args.status,
                  
                        },
                    },
                    {new:true}
                )
            }
        },

    }
});


module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation,

})
