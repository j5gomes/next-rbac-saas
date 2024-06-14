import { ability } from '@saas/auth'

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const userCanDeleteSomeoneElse = ability.can('delete', 'User')
const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(userCanInviteSomeoneElse)
console.log(userCanDeleteSomeoneElse)
console.log(userCannotDeleteOtherUsers)
