package com.dcfest.notifications.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class EventScheduleService {

    @Scheduled(cron = "*/1 * * * * *") // This will run every 1 second
    public void sendEventNotifications() {
        // LocalDateTime now = LocalDateTime.now();
        // LocalDate startOfDay = LocalDate.now(); // Midnight today
        // LocalDate startOfNextDay = startOfDay.plusDays(1); // Midnight tomorrow

        // Fetch all the rounds with a start time today (from midnight today to before
        // midnight
        // tomorrow)

        // List<RoundModel> roundModels =
        // this.roundRepository.findByStartDateBetween(startOfDay, startOfNextDay);
        //
        // for (RoundModel roundModel : roundModels) {
        // if (roundModel.isDisableNotifications()) {
        // continue;
        // }
        // if (roundModel.getEndTime().isBefore(LocalDateTime.now()) ||
        // roundModel.getEndTime().isEqual(LocalDateTime.now())) {
        // // Round is completed
        // roundModel.setStatus(RoundStatus.FINISHED);
        // this.roundRepository.save(roundModel);
        // }
        // AvailableEventModel availableEventModel =
        // this.availableEventRepository.findById(roundModel.getId()).orElse(null);
        // if (availableEventModel == null) {
        // continue;
        // }
        //
        // LocalDateTime eventStartTime = roundModel.getStartTime();
        // LocalDateTime threeHoursBefore = eventStartTime.minusHours(3);
        // LocalDateTime oneHourBefore = eventStartTime.minusHours(1);
        //
        // if (now.toLocalDate().isEqual(eventStartTime.toLocalDate()) &&
        // now.truncatedTo(ChronoUnit.MINUTES)
        // .equals(eventStartTime.toLocalDate().atStartOfDay().truncatedTo(ChronoUnit.MINUTES)))
        // {
        // // Send Visit Venue Reminder
        // sendVisitVenueReminder(availableEventModel, roundModel);
        // } else if (now.truncatedTo(ChronoUnit.MINUTES)
        // .equals(threeHoursBefore.truncatedTo(ChronoUnit.MINUTES))) {
        // sendIdentityProofReminder(availableEventModel, roundModel);
        // } else if
        // (now.truncatedTo(ChronoUnit.MINUTES).equals(oneHourBefore.truncatedTo(ChronoUnit.MINUTES)))
        // {
        // sendBestOfLuckMessage(availableEventModel, roundModel);
        // }
        // }
    }

}
