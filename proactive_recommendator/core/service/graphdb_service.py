from infrastructure.repository.graphdb.user import create_user


async def test_create_user_info(label: str, obj: str):
    user = await create_user(label, obj)
    assert user["u"]["name"] == label
    assert user["u"]["email"] == obj
    print("User created successfully:", user)
    return user