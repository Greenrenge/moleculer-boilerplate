add group
remove friend
remove public view
change to nodemon ?
instance ?
normalize error ?

if implement as msgqueue, what if restart service and need to rollback the message ?

# tech

- refresh token, once expired, need to re-login, if access token has been re-issued by refresh token, multiple token will be valid, need to handle it by expire with the shortest lifetime
- refresh token may be rotation everytime access token is re-issued, see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation

- UI: keep sessionStorage token for user , https://github.com/apollographql/apollo-client/issues/7064, https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#silent-refresh
- request and then permission changed in the middle of request ? override by the new permission and find the way to force user has new token ?

# business

branch
