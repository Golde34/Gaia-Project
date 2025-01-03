from dotenv import load_dotenv
import os


load_dotenv()

def load_env_for_auth():
    user_id = os.getenv("USER_ID")
    username = os.getenv("USERNAME")
    password = os.getenv("PASSWORD")
    name = os.getenv("NAME")
    email = os.getenv("EMAIL")
    email_password = os.getenv("EMAIL_PWD")
    return user_id, username, password, name, email, email_password

def load_bert_env():
    bert_model_path = os.getenv("BERT_MODEL_PATH")
    training_dataset = os.getenv("TRAINING_DATASET")
    meta_model_path = os.getenv("META_MODEL_PATH")
    model_path = os.getenv("MODEL_PATH")
    return bert_model_path, training_dataset, meta_model_path, model_path

def load_alpaca_env():
    google_colab_link = os.getenv("GOOGLE_COLAB_LINK")
    return google_colab_link

def load_task_prediction_env():
    model_name = os.getenv("TASK_MODEL_PATH")
    train_data = os.getenv("TASK_TRAINING_DATASET")
    return model_name, train_data
