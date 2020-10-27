import getUserId from '../utils/getUserId'
const User = {
    email: {
        fragement: 'fragement userId on User { id }',
        resolve(parent, args, { request }, info ) {
            const userId = getUserId(request, false)
            if(userId && userId == parent.id) {
                return parent.email
            }
            return null
        }
    }
    }

export { User as default }