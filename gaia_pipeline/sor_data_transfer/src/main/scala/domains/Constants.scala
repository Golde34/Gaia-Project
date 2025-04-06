package domains

object Constants {

  object StringConstants {
    final val EMPTY_SENTENCE: String = "This task has no sentence"
  }

  object KafkaTopic {
    final val SOR_TRAINING_MODEL: String = "gaia.sor-training-model.topic"
    final val CREATE_TASK: String = "task-manager.handle-task.topic"
    final val SCHEDULE_CREATE_TASK: String = "schedule-plan.create-schedule-task.topic"
  }

  object KafkaCmd {
    final val CSV_SAVING: String = "saveOutputToCSV"
    final val DATABASE_SAVING: String = "saveOutputToDatabase"
    final val ALL_SAVING: String = "saveOutputToAll"

    final val GAIA_CREATE_TASK: String = "gaiaCreateTask"
    final val TM_CREATE_TASK: String = "taskManagerCreateTask"
    
    final val CREATE_SCHEDULE_TASK: String = "schedulePlanCreateTask"
  }

  object TaskStatus {
    final val PENDING: String = "PENDING"
    final val TODO: String = "TODO"
    final val IN_PROGRESS: String = "IN PROGRESS"
    final val DONE: String = "DONE"
  }

  object StopWords {
    final val STOPWORDS = Set(
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "if",
      "else",
      "while",
      "for",
      "to",
      "from",
      "at",
      "by",
      "with",
      "about",
      "against",
      "between",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "up",
      "down",
      "in",
      "out",
      "on",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "some",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "this",
      "that",
      "these",
      "those"
    )
  }
}
