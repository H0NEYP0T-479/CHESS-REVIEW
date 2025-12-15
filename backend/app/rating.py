"""Rating calculation using Elo system"""
from typing import Tuple


def calculate_elo_change(
    player_rating: int,
    opponent_rating: int,
    result: float,  # 1.0 for win, 0.5 for draw, 0.0 for loss
    k_factor: int = 32
) -> int:
    """
    Calculate Elo rating change for a player
    
    Args:
        player_rating: Current rating of the player
        opponent_rating: Current rating of the opponent
        result: Game result from player's perspective (1.0=win, 0.5=draw, 0.0=loss)
        k_factor: K-factor for rating volatility (default 32)
    
    Returns:
        Rating change (positive or negative)
    """
    # Calculate expected score
    expected_score = 1 / (1 + 10 ** ((opponent_rating - player_rating) / 400))
    
    # Calculate rating change
    rating_change = int(k_factor * (result - expected_score))
    
    return rating_change


def update_ratings(
    white_rating: int,
    black_rating: int,
    result: str,  # "white_win", "black_win", or "draw"
    k_factor: int = 32
) -> Tuple[int, int]:
    """
    Update ratings for both players after a game
    
    Args:
        white_rating: Current rating of white player
        black_rating: Current rating of black player
        result: Game result ("white_win", "black_win", or "draw")
        k_factor: K-factor for rating volatility
    
    Returns:
        Tuple of (new_white_rating, new_black_rating)
    """
    # Determine result scores
    if result == "white_win":
        white_result = 1.0
        black_result = 0.0
    elif result == "black_win":
        white_result = 0.0
        black_result = 1.0
    else:  # draw
        white_result = 0.5
        black_result = 0.5
    
    # Calculate rating changes
    white_change = calculate_elo_change(white_rating, black_rating, white_result, k_factor)
    black_change = calculate_elo_change(black_rating, white_rating, black_result, k_factor)
    
    # Apply changes
    new_white_rating = white_rating + white_change
    new_black_rating = black_rating + black_change
    
    # Ensure ratings don't go below 100
    new_white_rating = max(100, new_white_rating)
    new_black_rating = max(100, new_black_rating)
    
    return new_white_rating, new_black_rating


def get_k_factor(rating: int, games_played: int) -> int:
    """
    Get appropriate K-factor based on rating and experience
    
    Args:
        rating: Current rating of the player
        games_played: Number of games played
    
    Returns:
        K-factor to use for rating calculation
    """
    # Provisional players (< 30 games) get higher K-factor
    if games_played < 30:
        return 40
    
    # Strong players (> 2400) get lower K-factor
    if rating >= 2400:
        return 16
    
    # Regular players
    return 32
