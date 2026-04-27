async function get_transactions({limit = 5, page = 1, category, account, search} = {}){

    // This is a JS API to create query Parameters easily
    // the ...() is for evaluating, if category is truthy then it uses the one given if not then it unpacks nothing
    const params = new URLSearchParams({
        limit, page,
        ...(category && { category }),
        ...(account && { account }),
        ...(search && { search })
    })

    const res = await fetch(`/api/transactions?${params}`)

    if(!res.ok){ throw new Error('Error in Fetching the Transactions')}

    const data = await res.json()
    return data
}

async function get_accounts(){
    const res = await fetch("/api/accounts")

    if(!res.ok){ throw new Error('Error in Fetching the Accounts')}
    const data = await res.json()
    return data.accounts
}

async function get_categories(){
    const res = await fetch("/api/categories")

    if(!res.ok){ throw new Error('Error in Fetching the Categories')}
    const data = await res.json()
    return data.categories
}

