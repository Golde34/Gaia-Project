import transformers

MAX_LEN = 128
TRAIN_BATCH_SIZE = 64
VALID_BATCH_SIZE = 8
EPOCHS = 10
BASE_MODEL_PATH = "../data/bert-base-uncased"
MODEL_PATH = "model.bin"
TRAINING_FILE = "../data/ner_dataset.csv"
META_MODEL = "meta.bin"
TOKENIZER = transformers.BertTokenizer.from_pretrained(
    BASE_MODEL_PATH,
    do_lower_case=True
)