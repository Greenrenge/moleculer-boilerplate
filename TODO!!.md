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
- invitation with magic link to create a password
- cloudflare worker + kv to cache ?

# framework

- use ctx.call instead of broker.call, ctx.emit instead of broker.emit, it will reserve the context,meta
- increase timeout / retry for a important flow that like transactional
- use fallbackResponse for return a cached when service is down or timeout or use to rollback things, it can be both on receiver side or sender side
- we can prevent ddos attack or rate limit by use Bulkhead to limit the number of concurrent requests to a service, or Circuit Breaker to prevent a service from being overwhelmed by requests, or Timeout to limit the time a request can take
- when use the ctx.call The meta is sent back to the caller service. Use it to send extra meta information back to the caller. E.g.: send response headers back to API gateway or set resolved logged in user to metadata.
- better use mcall with settled option
- actions has Action visibility to restrict the action to be called from other services, or to be called from the public API gateway, or to be called from the internal API gateway
- ctx.locals is use to send data from hook to action handler, or from action handler to other hooks
- try https://github.com/moleculerjs/moleculer-channels#readme

# business

- branch
- employee code
- position's level (C level, Operation Level, Manager Level)
- syncing the new employee ?? hr need to add user to this system, --> ask June that another HR solution can export excel file and then import to this system
- upload new/existing emp will create/update user --> what if user has been changed manual by admin , so we override it anyway ?
- use Error hooks of the service/action to log the error, or use Error middleware to log the error

# UI - static page

- nextjs server component 'use server', useFormState,
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Authentication for server component https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#authentication-and-authorization
- error handling
- https://nextjs.org/docs/app/building-your-application/routing/parallel-routes - for admin and user have different layout
- intercepting routes, show modal
- https://nextjs.org/docs/app/building-your-application/routing/internationalization

UI: login, no signup

ADMIN MENU

- log management
- popup announcement management (popup as markdown)
- email broadcast management (email as markdown), multiple users selection, set to agenda / mq
- user management , list of user, add user, edit user, delete user [multiple], import/upsert user, resent invitation, reset password link or manual

- position management, list of position, add position, edit position, delete position [multiple], import --> should be template
- position's level (C level, Operation Level, Manager Level)
- branch management, list of branch, add branch, edit branch, delete branch [multiple], import --> should be template
- department management, list of department, add department, edit department, delete department [multiple], import --> should be template
- org chart and underling management

- role management, list of role, add role, edit role, delete role [multiple], assign role to user , assign permission to role, assign users to role
- menu setting
- evaluation setting, have it own link and will be configured to sent to all user in the system
- multi lang ?

# typescript

method to service
call by enum type with verify payload
