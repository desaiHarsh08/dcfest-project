package com.dcfest.notifications.scheduler;

import com.dcfest.constants.RoundStatus;
import com.dcfest.models.*;
import com.dcfest.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dcfest.notifications.email.EmailServices;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EventScheduleService {

    @Autowired
    private AvailableEventRepository availableEventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    // Uncomment for WhatsApp integration in the future
    // @Autowired
    // private WhatsAppService whatsappService;

    @Autowired
    private RoundRepository roundRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Scheduled(cron = "*/1 * * * * *") // This will run every 1 second
    public void sendEventNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate startOfDay = LocalDate.now(); // Midnight today
        LocalDate startOfNextDay = startOfDay.plusDays(1); // Midnight tomorrow

        // Fetch all the rounds with a start time today (from midnight today to before midnight
        // tomorrow)

//        List<RoundModel> roundModels = this.roundRepository.findByStartDateBetween(startOfDay, startOfNextDay);
//
//        for (RoundModel roundModel : roundModels) {
//            if (roundModel.isDisableNotifications()) {
//                continue;
//            }
//            if (roundModel.getEndTime().isBefore(LocalDateTime.now()) || roundModel.getEndTime().isEqual(LocalDateTime.now())) {
//                // Round is completed
//                roundModel.setStatus(RoundStatus.FINISHED);
//                this.roundRepository.save(roundModel);
//            }
//            AvailableEventModel availableEventModel = this.availableEventRepository.findById(roundModel.getId()).orElse(null);
//            if (availableEventModel == null) {
//                continue;
//            }
//
//            LocalDateTime eventStartTime = roundModel.getStartTime();
//            LocalDateTime threeHoursBefore = eventStartTime.minusHours(3);
//            LocalDateTime oneHourBefore = eventStartTime.minusHours(1);
//
//            if (now.toLocalDate().isEqual(eventStartTime.toLocalDate()) &&
//                    now.truncatedTo(ChronoUnit.MINUTES)
//                            .equals(eventStartTime.toLocalDate().atStartOfDay().truncatedTo(ChronoUnit.MINUTES))) {
//                // Send Visit Venue Reminder
//                sendVisitVenueReminder(availableEventModel, roundModel);
//            } else if (now.truncatedTo(ChronoUnit.MINUTES)
//                    .equals(threeHoursBefore.truncatedTo(ChronoUnit.MINUTES))) {
//                sendIdentityProofReminder(availableEventModel, roundModel);
//            } else if (now.truncatedTo(ChronoUnit.MINUTES).equals(oneHourBefore.truncatedTo(ChronoUnit.MINUTES))) {
//                sendBestOfLuckMessage(availableEventModel, roundModel);
//            }
//        }
    }

    // Condition: This should be passed at the midnight time of the event day
    private void sendVisitVenueReminder(AvailableEventModel availableEventModel, RoundModel roundModel) {
        // WhatsApp message (concise but detailed)
        String whatsappMessage = "Reminder: You are scheduled to visit the venue for the event '" +
                availableEventModel.getTitle() + "'.\n" +
                "Venue: " + roundModel.getVenue() + "\n" +
                "Date: " + roundModel.getStartDate() + "\n" +
                "Time: " + roundModel.getStartTime() + " - " + roundModel.getEndTime() + ".";

        // Email message (professional, with detailed info)
        String emailMessage = "Dear Participant,<br><br>" +
                "This is a reminder that you need to visit the venue 2 hours before the event " +
                "<strong>" + availableEventModel.getTitle() + "</strong>.<br>" +
                "Please arrive at <strong>" + roundModel.getVenue() + "</strong>.<br><br>" +
                "Event Date & Time: <strong>" + roundModel.getStatus() + " at " +
                roundModel.getEndTime() + "</strong>.<br>" +
                "We look forward to seeing you.<br><br>" +
                "Best regards,<br>The Umang DCFest Team";

        sendEventNotificationToParticipants(availableEventModel, whatsappMessage, emailMessage);
    }

    // Condition: This should be passed before the 3hrs of the start of the event
    private void sendIdentityProofReminder(AvailableEventModel availableEventModel, RoundModel roundModel) {
        // WhatsApp message
        String whatsappMessage = "Reminder: 3 hours left for '" + availableEventModel.getTitle() +
                "'. Don't forget your ID proof. Starts at " + roundModel.getStartTime() + ".";

        // Email message
        String emailMessage = "Dear Participant,<br><br>" +
                "This is a reminder that there are 3 hours left for the event " +
                "<strong>" + availableEventModel.getTitle() + "</strong>.<br>" +
                "Please bring a valid identity proof for entry at the venue.<br>" +
                "Event Date & Time: <strong>" + roundModel.getStartTime().toLocalDate() + " at " +
                roundModel.getStartTime().toLocalTime() + "</strong>.<br><br>" +
                "Venue: <strong>" + roundModel.getVenue() + "</strong>.<br><br>" +
                "Best regards,<br>The Umang DCFest Team";

        sendEventNotificationToParticipants(availableEventModel, whatsappMessage, emailMessage);
    }

    // Condition: This should be passed before the 1hr of the start of the event
    private void sendBestOfLuckMessage(AvailableEventModel availableEventModel, RoundModel roundModel) {
        // WhatsApp message
        String whatsappMessage = "1 hour to go! Best of luck for '" + availableEventModel.getTitle() +
                "'. Be ready and enjoy!";

        // Email message
        String emailMessage = "Dear Participant,<br><br>" +
                "Best of luck! The event <strong>" + availableEventModel.getTitle() + "</strong> " +
                "will begin in 1 hour.<br>" +
                "Event Date & Time: <strong>" + roundModel.getStartTime().toLocalDate() + " at " +
                roundModel.getStartTime().toLocalTime() + "</strong>.<br>" +
                "Venue: <strong>" + roundModel.getVenue() + "</strong>.<br><br>" +
                "We hope you enjoy the event.<br><br>" +
                "Best regards,<br>The Umang DCFest Team";

        sendEventNotificationToParticipants(availableEventModel, whatsappMessage, emailMessage);
    }

    private void sendEventNotificationToParticipants(AvailableEventModel availableEventModel, String whatsappMessage,
            String emailMessage) {
        System.out.println("Scheduled task triggered at: " + LocalDateTime.now());
        System.out.println("available event: " + availableEventModel.getId());

        // Get all participants for the event
        List<ParticipantModel> participantModels = participantRepository
                .findByAvailableEventId(availableEventModel.getId());

        // Send notifications to all participants
        for (ParticipantModel participant : participantModels) {
            String subject = "Event Notification for " + availableEventModel.getTitle();

            // Check if the notification has already been sent
            NotificationLogModel existingLog = notificationLogRepository
                    .findByAvailableEventAndParticipant(availableEventModel, participant);
            if (existingLog != null) {
                // If the log exists, skip sending
                continue;
            }

            // Send Email
            this.emailServices.sendSimpleMessage(participant.getEmail(), subject, emailMessage);

            // Uncomment below for WhatsApp notifications when integrated
            // whatsappService.sendMessage(participant.getPhoneNumber(), whatsappMessage);

            // Log the notification
            NotificationLogModel notificationLog = new NotificationLogModel();
            notificationLog.setAvailableEvent(availableEventModel);
            notificationLog.setParticipant(participant);
            notificationLog.setMessage(whatsappMessage); // Log message
            notificationLog.setSentAt(LocalDateTime.now());
            notificationLogRepository.save(notificationLog);
        }
    }

}
