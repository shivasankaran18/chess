
def format_moves_for_chat(moves: list, user_id: int) -> str:
    moves.sort(key=lambda m: m.moveNumber)
    formatted = []

    i = 0
    while i < len(moves):
        move_number = (moves[i].moveNumber + 1) // 2

        move1 = moves[i]
        move1_str = f"{move1.san} (You)" if move1.playerId == user_id else f"{move1.san} (Opponent)"

        if i + 1 < len(moves):
            move2 = moves[i + 1]
            move2_str = f"{move2.san} (You)" if move2.playerId == user_id else f"{move2.san} (Opponent)"
            line = f"{move_number}. {move1_str} {move2_str}"
        else:
            line = f"{move_number}. {move1_str}"

        formatted.append(line)
        i += 2

    return "\n".join(formatted)

