def summarize_conversation_context(chat_logs: list, max_turns: int = 10) -> str:
    """
    Compresses long conversation logs into a concise executive context summary
    to optimize context window limits while preserving key facts.
    """
    if not chat_logs or len(chat_logs) <= max_turns:
        return "Full conversation history active within standard context window."

    # Extract user queries and agent intents
    queries = [msg.get("text", "") for msg in chat_logs if msg.get("sender") == "user"]
    intents = [msg.get("role", "") for msg in chat_logs if msg.get("sender") == "agent"]

    summary = (
        f"CONVERSATION CONTEXT SUMMARY ({len(chat_logs)} messages, {len(queries)} user turns):\n"
        f"• Key User Topics: {', '.join(queries[-4:])}\n"
        f"• Active Agents Involved: {', '.join(set(intents[-4:]))}\n"
        f"• Context State: Compacted for optimal inference."
    )

    return summary
