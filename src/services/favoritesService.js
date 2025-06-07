import { supabase } from '../lib/supabase'

export const favoritesService = {
  // Pobierz ulubione tokeny użytkownika
  async getFavorites(userId) {
    const { data, error } = await supabase
      .from('favorite_tokens')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Dodaj token do ulubionych
  async addFavorite(userId, tokenData) {
    const { data, error } = await supabase
      .from('favorite_tokens')
      .insert({
        user_id: userId,
        token_address: tokenData.tokenAddress,
        chain_id: tokenData.chainId,
        token_name: tokenData.tokenName,
        token_symbol: tokenData.tokenSymbol,
        token_logo: tokenData.tokenLogo
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Usuń token z ulubionych
  async removeFavorite(userId, tokenAddress, chainId) {
    const { error } = await supabase
      .from('favorite_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token_address', tokenAddress)
      .eq('chain_id', chainId)

    if (error) throw error
  },

  // Sprawdź czy token jest w ulubionych
  async isFavorite(userId, tokenAddress, chainId) {
    const { data, error } = await supabase
      .from('favorite_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token_address', tokenAddress)
      .eq('chain_id', chainId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Pobierz statystyki ulubionych
  async getFavoritesStats(userId) {
    const { data, error } = await supabase
      .from('favorite_tokens')
      .select('chain_id')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      total: data.length,
      byChain: {}
    }

    data.forEach(item => {
      stats.byChain[item.chain_id] = (stats.byChain[item.chain_id] || 0) + 1
    })

    return stats
  }
}