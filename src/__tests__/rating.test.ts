import { describe, it, expect } from 'vitest'

// Simple Elo calculation for testing (mimics backend logic)
function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: number,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
  const ratingChange = Math.floor(kFactor * (result - expectedScore))
  return ratingChange
}

describe('Elo Rating Calculation', () => {
  it('should calculate correct rating change for a win', () => {
    const playerRating = 1500
    const opponentRating = 1500
    const result = 1.0 // win
    
    const change = calculateEloChange(playerRating, opponentRating, result)
    expect(change).toBe(16) // Expected: +16 for equal players
  })
  
  it('should calculate correct rating change for a loss', () => {
    const playerRating = 1500
    const opponentRating = 1500
    const result = 0.0 // loss
    
    const change = calculateEloChange(playerRating, opponentRating, result)
    expect(change).toBe(-16) // Expected: -16 for equal players
  })
  
  it('should calculate correct rating change for a draw', () => {
    const playerRating = 1500
    const opponentRating = 1500
    const result = 0.5 // draw
    
    const change = calculateEloChange(playerRating, opponentRating, result)
    expect(change).toBe(0) // Expected: 0 for equal players drawing
  })
  
  it('should give larger gains when beating higher rated player', () => {
    const playerRating = 1500
    const opponentRating = 1700
    const result = 1.0 // win
    
    const change = calculateEloChange(playerRating, opponentRating, result)
    expect(change).toBeGreaterThan(16) // Should gain more than beating equal player
  })
  
  it('should give smaller losses when losing to higher rated player', () => {
    const playerRating = 1500
    const opponentRating = 1700
    const result = 0.0 // loss
    
    const change = calculateEloChange(playerRating, opponentRating, result)
    expect(Math.abs(change)).toBeLessThan(16) // Should lose less than losing to equal player
  })
})
