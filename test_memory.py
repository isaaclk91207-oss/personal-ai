from memory import upsert_memory, get_memory

upsert_memory(
    "job",
    "React Native Developer"
)

print(
    get_memory("job")
)

upsert_memory(
    "job",
    "AI Engineer"
)

print(
    get_memory("job")
)